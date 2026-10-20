import { RotateCcwIcon } from 'lucide-react'
import { useRef } from 'react'
import { CardList, CardListItem, CardListLine } from '@/components/card-list'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  autoMatch,
  DATE_FORMATS,
  DONT_IMPORT,
  FIELDS,
  mappingProblems,
  NO_FIELD,
  setColumnField,
  setColumnImport,
  type DateFormat,
  type DecimalSeparator,
  type ImportSettings,
  type ParsedFile,
} from '@/lib/csv-import'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

export function MatchStep({
  file,
  settings,
  suggested,
  onChange,
  onBack,
  onNext,
}: {
  file: ParsedFile
  settings: ImportSettings
  suggested: { dateFormat: DateFormat; decimal: DecimalSeparator }
  onChange: (settings: ImportSettings) => void
  onBack: () => void
  onNext: () => void
}) {
  const phone = useIsMobile()
  const problemsRef = useRef<HTMLDivElement>(null)
  const fields = FIELDS[settings.type]
  const problems = mappingProblems(settings.mapping, settings.type, file.headers)
  // The field each switched-off column had, so switching it back on restores it.
  const remembered = useRef<Record<number, string>>({})
  const example = (column: number) => file.rows.find((r) => r[column])?.[column] ?? '—'

  const name = (column: number) => file.headers[column] || `Column ${column + 1}`
  // What was matched when the file was read; the reset button returns to it.
  const automatic = autoMatch(file.headers, settings.type)
  const changed = settings.mapping.some((m, i) => m !== automatic[i])

  /**
   * The other column a field was moved to, so the menu can say a pick will swap
   * with it. Fields still on their automatic column need no label.
   */
  const movedTo = (field: string, column: number) => {
    const other = settings.mapping.findIndex((m, i) => i !== column && m === field)
    return other === -1 || automatic[other] === field ? undefined : name(other)
  }

  function setColumn(column: number, field: string) {
    onChange({ ...settings, mapping: setColumnField(settings.mapping, column, field) })
  }

  function setImport(column: number, on: boolean) {
    if (!on) remembered.current[column] = settings.mapping[column]
    const restore = remembered.current[column] ?? automatic[column]
    onChange({ ...settings, mapping: setColumnImport(settings.mapping, column, on, restore) })
  }

  // The reset button, field menu and Import switch, shared by the table and the phone list.
  const resetButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* aria-disabled rather than disabled, so the tooltip still explains it. */}
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Reset matching"
          aria-disabled={!changed}
          className="aria-disabled:opacity-50"
          onClick={() => changed && onChange({ ...settings, mapping: automatic })}
        >
          <RotateCcwIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">
        {changed
          ? 'Undo your changes and go back to the fields Studio Ledger matched automatically.'
          : 'Nothing to reset. These are the fields Studio Ledger matched automatically.'}
      </TooltipContent>
    </Tooltip>
  )

  function fieldSelect(column: number) {
    const value = settings.mapping[column]
    const on = value !== DONT_IMPORT
    return (
      <>
        {/* An empty value shows the placeholder: "Not imported" when off, "Choose a field" when on. */}
        <Select disabled={!on} value={on ? value : NO_FIELD} onValueChange={(v) => setColumn(column, v)}>
          <SelectTrigger
            className="w-full"
            aria-label={`Field for ${name(column)}`}
            aria-invalid={value === NO_FIELD ? true : undefined}
          >
            <SelectValue placeholder={on ? 'Choose a field' : 'Not imported'} />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => {
              const from = movedTo(f.key, column)
              return (
                <SelectItem key={f.key} value={f.key}>
                  {f.label}
                  {!f.required && <span className="text-muted-foreground">(optional)</span>}
                  {/* Picking a field another column has swaps the two. */}
                  {from && <span className="text-muted-foreground"> · {from}</span>}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </>
    )
  }

  function importSwitch(column: number) {
    const value = settings.mapping[column]
    const on = value !== DONT_IMPORT
    const required = fields.find((f) => f.key === value && f.required)
    return (
      <>
        {required ? (
          // Locked on: a required field has to be imported. It shows on, at the reduced
          // opacity shadcn uses for disabled controls; aria-disabled keeps it focusable
          // so the tooltip can say why. Its field menu still works.
          <Tooltip>
            {/* A wrapper as the trigger, so the tooltip's data-state doesn't replace the switch's. */}
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Switch
                  checked
                  aria-disabled
                  aria-label={`Import ${name(column)}`}
                  className="cursor-not-allowed opacity-50"
                  onClick={(e) => e.preventDefault()}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64">
              {required.label} is required for {settings.type}. To import it from another column,
              choose {required.label} in that column's menu.
            </TooltipContent>
          </Tooltip>
        ) : (
          <Switch
            checked={on}
            onCheckedChange={(checked) => setImport(column, checked)}
            aria-label={`Import ${name(column)}`}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {phone ? (
        // On phones each file column is a short row: its name and Import switch, its first
        // value, then the Studio Ledger field menu.
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
            Match each column to a Studio Ledger field
            {resetButton}
          </div>
          <CardList aria-label="Columns in your file" className="my-0">
            {file.headers.map((_, column) => {
              const on = settings.mapping[column] !== DONT_IMPORT
              return (
                <CardListItem key={column} className={cn(!on && 'text-muted-foreground')}>
                  <CardListLine>
                    <span className={cn('truncate', on && 'font-medium')}>{name(column)}</span>
                    {importSwitch(column)}
                  </CardListLine>
                  <div className="truncate text-muted-foreground">First value: {example(column)}</div>
                  <div className="pt-1">{fieldSelect(column)}</div>
                </CardListItem>
              )
            })}
          </CardList>
        </div>
      ) : (
        <Table className="min-w-[36rem] table-fixed">
          <colgroup>
            <col />
            <col />
            <col className="w-56" />
            <col className="w-20" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Column in your file</TableHead>
              <TableHead>First value</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Studio Ledger field
                  {resetButton}
                </div>
              </TableHead>
              <TableHead>Import</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {file.headers.map((_, column) => {
              const value = settings.mapping[column]
              const on = value !== DONT_IMPORT
              return (
                <TableRow key={column} className={cn(!on && 'text-muted-foreground')}>
                  <TableCell className={cn('truncate', on && 'font-medium')}>{name(column)}</TableCell>
                  <TableCell className="truncate text-muted-foreground">{example(column)}</TableCell>
                  <TableCell>
                    {fieldSelect(column)}
                  </TableCell>
                  <TableCell>
                    {importSwitch(column)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="date-format">Date format</Label>
          <Select
            value={settings.dateFormat}
            onValueChange={(v) => onChange({ ...settings, dateFormat: v as DateFormat })}
          >
            <SelectTrigger id="date-format" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                  {f === suggested.dateFormat && <span className="text-muted-foreground">(suggested)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="decimal">Decimal separator</Label>
          <Select
            value={settings.decimal}
            onValueChange={(v) => onChange({ ...settings, decimal: v as DecimalSeparator })}
          >
            <SelectTrigger id="decimal" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['dot', 'comma'] as const).map((d) => (
                <SelectItem key={d} value={d}>
                  {d === 'dot' ? 'Dot (1,250.00)' : 'Comma (1.250,00)'}
                  {d === suggested.decimal && <span className="text-muted-foreground">(suggested)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {problems.length > 0 && (
        <div
          ref={problemsRef}
          tabIndex={-1}
          aria-live="polite"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm outline-none"
        >
          <p className="font-medium text-destructive">Before you continue:</p>
          <ul className="mt-1 list-disc pl-5 text-destructive">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => (problems.length > 0 ? problemsRef.current?.focus() : onNext())}>
          Preview records
        </Button>
      </div>
    </div>
  )
}
