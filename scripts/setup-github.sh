#!/usr/bin/env bash
# Creates the labels, the "MVP" milestone and one issue per user story.
#
# Stories come from docs/user-stories.md; story text and acceptance criteria
# come from docs/PRD.md.
# Safe to re-run: labels, the milestone and issues that already exist are skipped.
#
# Usage:
#   scripts/setup-github.sh            # run against the current repo (needs `gh auth login`)
#   scripts/setup-github.sh --dry-run  # print what would be created; no gh needed
#   scripts/setup-github.sh --repo owner/name

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STORIES="$ROOT/docs/user-stories.md"
PRD="$ROOT/docs/PRD.md"
MILESTONE="MVP"
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --repo) export GH_REPO="$2"; shift ;;  # honoured by every gh command
    -h|--help) sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

if grep -q '^> Placeholder' "$PRD"; then
  echo "docs/PRD.md is still the placeholder. Write the PRD into it first." >&2
  exit 1
fi

if [ "$DRY_RUN" -eq 0 ]; then
  command -v gh >/dev/null || { echo "gh CLI not found: https://cli.github.com" >&2; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first." >&2; exit 1; }
fi

gh_run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '[dry-run] gh'; printf ' %q' "$@"; printf '\n'
  else
    gh "$@"
  fi
}

# ---------- labels ----------

existing_labels=""
if [ "$DRY_RUN" -eq 0 ]; then
  existing_labels="$(gh label list --limit 500 --json name --jq '.[].name')"
fi

label() { # name color description
  if [ -n "$existing_labels" ] && printf '%s\n' "$existing_labels" | grep -Fxq "$1"; then
    echo "Label \"$1\" exists, skipping"
  else
    gh_run label create "$1" --color "$2" --description "$3"
  fi
}

echo "== Labels"
label "priority: must"      "B60205" "Required for release"
label "priority: should"    "FBCA04" "Only after every Must in the same area ships"
label "area: dashboard"     "1D76DB" "Overview dashboard"
label "area: invoices"      "0E8A16" "Invoices and clients"
label "area: expenses"      "5319E7" "Expenses"
label "area: import"        "006B75" "CSV import"
label "area: sample-data"   "C5DEF5" "Fictional sample dataset"
label "area: settings"      "BFD4F2" "Settings, including currency"

# ---------- milestone ----------

echo "== Milestone"
if [ "$DRY_RUN" -eq 1 ]; then
  echo "[dry-run] create milestone \"$MILESTONE\" if missing"
else
  existing="$(gh api "repos/{owner}/{repo}/milestones?state=all&per_page=100" --jq ".[] | select(.title == \"$MILESTONE\") | .title")"
  if [ -n "$existing" ]; then
    echo "Milestone \"$MILESTONE\" exists, skipping"
  else
    gh api "repos/{owner}/{repo}/milestones" \
      -f title="$MILESTONE" -f description="Studio Ledger v1.0: every Must story in docs/PRD.md" >/dev/null
    echo "Created milestone \"$MILESTONE\""
  fi
fi

# ---------- issues ----------

# Prints the story sentence for an ID (empty for F-areas without a sentence).
story_sentence() {
  awk -v id="$1" '
    index($0, "**" id " · ") == 1 { sub(/^.*\*\* — /, ""); print; exit }
  ' "$PRD"
}

# Prints the acceptance criteria checklist for an ID.
# US-x.y: the "- [ ]" lines under its "**US-x.y · …**" line.
# Fn:     the "- [ ]" lines directly under its "### Fn." heading.
criteria() {
  awk -v id="$1" '
    function starts(s) { return index($0, s) == 1 }
    !on && id ~ /^US-/ && starts("**" id " · ") { on = 1; next }
    !on && id ~ /^F[0-9]+$/ && starts("### " id ".") { on = 1; next }
    on && (starts("**") || starts("#") || starts("---")) { exit }
    on && starts("- [ ]") { print }
  ' "$PRD"
}

slug() { echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-'; }

existing_titles=""
if [ "$DRY_RUN" -eq 0 ]; then
  existing_titles="$(gh issue list --state all --limit 500 --json title --jq '.[].title')"
fi

echo "== Issues"
created=0
skipped=0
# Table rows of docs/user-stories.md: | ID | Story | Priority | Area |
while IFS='|' read -r _ id title priority area _; do
  id="$(echo "$id" | xargs)"; title="$(echo "$title" | xargs)"
  priority="$(echo "$priority" | xargs)"; area="$(echo "$area" | xargs)"

  issue_title="$id · $title"
  if [ -n "$existing_titles" ] && printf '%s\n' "$existing_titles" | grep -Fxq "$issue_title"; then
    echo "Exists, skipping: $issue_title"
    skipped=$((skipped + 1))
    continue
  fi

  sentence="$(story_sentence "$id")"
  [ -n "$sentence" ] || sentence="$title."
  checklist="$(criteria "$id")"
  if [ -z "$checklist" ]; then
    echo "No acceptance criteria found in docs/PRD.md for $id" >&2
    exit 1
  fi

  # Same fields as .github/ISSUE_TEMPLATE/user-story.yml.
  body="$(printf '### Story\n\n%s\n\n### Priority\n\n%s\n\n### Area\n\n%s\n\n### Acceptance criteria\n\n%s\n' \
    "$sentence" "$priority" "$area" "$checklist")"

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "----- $issue_title  [priority: $(slug "$priority"), area: $(slug "$area"), milestone: $MILESTONE]"
    echo "$body"
  else
    gh issue create \
      --title "$issue_title" --body "$body" --milestone "$MILESTONE" \
      --label "priority: $(slug "$priority")" --label "area: $(slug "$area")"
  fi
  created=$((created + 1))
done < <(grep -E '^\| (US-[0-9]+\.[0-9]+|F[0-9]+) \|' "$STORIES")

echo "== Done: $created issue(s) to create, $skipped skipped"
