/** Period change as a whole percentage, e.g. "+12%", or "—" when there is no previous value. */
export function formatChange(change: number | null): string {
  if (change === null) return '—'
  const rounded = Math.round(change)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}
