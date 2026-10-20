import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DATE_FORMATS,
  DONT_IMPORT,
  FIELDS,
  mappingProblems,
  NO_FIELD,
  requiredFields,
  type DateFormat,
  type DecimalSeparator,
  type ImportSettings,
  type ParsedFile,
} from '@/lib/csv-import'
import { cn } from '@/lib/utils'

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
  const requiredRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const fields = FIELDS[settings.type]
  const required = requiredFields(settings.mapping, settings.type)
  const blocked = mappingProblems(settings.mapping, settings.type).length > 0
  const example = (column: number) => file.rows.find((r) => r[column])?.[column] ?? '—'
  const name = (column: number) => file.headers[column] || `Column ${column + 1}`

  /**
   * Picking a field another column uses moves it there and turns that column
   * off, so a field is never matched twice.
   */
  function setColumn(column: number, value: string) {
    const isField = value !== DONT_IMPORT && value !== NO_FIELD
    const mapping = settings.mapping.map((m, i) => {
      if (i === column) return value
      return isField && m === value ? DONT_IMPORT : m
    })
    onChange({ ...settings, mapping })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {/* Required fields sit right above the table, so a gap is visible where it's fixed. */}
        <div
          ref={requiredRef}
          tabIndex={-1}
          aria-live="polite"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm outline-none"
        >
          <span className="font-medium">Required fields</span>
          {required.map((f) => (
            <span
              key={f.key}
              className={cn(
                'flex items-center gap-1.5',
                f.matched ? 'text-muted-foreground' : 'font-medium text-destructive',
              )}
            >
              {f.matched ? (
                <CircleCheckIcon className="size-4 text-status-paid" aria-hidden />
              ) : (
                <CircleAlertIcon className="size-4" aria-hidden />
              )}
              {f.label}
              <span className={f.matched ? 'sr-only' : undefined}>{f.matched ? 'matched' : '· missing'}</span>
            </span>
          ))}
        </div>

        <div ref={tableRef}>
          <Table className="min-w-[40rem] table-fixed">
            <colgroup>
              <col className="w-20" />
              <col />
              <col />
              <col className="w-60" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Import</TableHead>
                <TableHead>Column in your file</TableHead>
                <TableHead>First value</TableHead>
                <TableHead>Studio Ledger field</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {file.headers.map((_, column) => {
                const value = settings.mapping[column]
                const on = value !== DONT_IMPORT
                const errorId = `column-${column}-error`
                return (
                  <TableRow key={column} className={cn(!on && 'text-muted-foreground')}>
                    <TableCell>
                      <Switch
                        checked={on}
                        onCheckedChange={(checked) => setColumn(column, checked ? NO_FIELD : DONT_IMPORT)}
                        aria-label={`Import ${name(column)}`}
                      />
                    </TableCell>
                    <TableCell className={cn('truncate', on && 'font-medium')}>{name(column)}</TableCell>
                    <TableCell className="truncate text-muted-foreground">{example(column)}</TableCell>
                    <TableCell>
                      {on ? (
                        <div className="grid gap-1">
                          <Select value={value} onValueChange={(v) => setColumn(column, v)}>
                            <SelectTrigger
                              className="w-full"
                              aria-label={`Field for ${name(column)}`}
                              aria-invalid={value === NO_FIELD ? true : undefined}
                              aria-describedby={value === NO_FIELD ? errorId : undefined}
                            >
                              <SelectValue placeholder="Choose a field" />
                            </SelectTrigger>
                            <SelectContent>
                              {fields.map((f) => (
                                <SelectItem key={f.key} value={f.key}>
                                  {f.label}
                                  {!f.required && <span className="text-muted-foreground">(optional)</span>}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {value === NO_FIELD && (
                            <p id={errorId} className="text-xs whitespace-normal text-destructive">
                              Choose a field, or turn this column off.
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm">Not imported</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

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

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => {
            if (!blocked) return onNext()
            // Send focus to the first row without a field, or to the required fields line.
            const invalid = tableRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ;(invalid ?? requiredRef.current)?.focus()
          }}
        >
          Preview records
        </Button>
      </div>
    </div>
  )
}
