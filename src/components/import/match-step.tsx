import { CircleCheckIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
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
import {
  DATE_FORMATS,
  DONT_IMPORT,
  FIELDS,
  mappingProblems,
  type DateFormat,
  type DecimalSeparator,
  type ImportSettings,
  type ParsedFile,
} from '@/lib/csv-import'

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
  const problemsRef = useRef<HTMLDivElement>(null)
  const fields = FIELDS[settings.type]
  const problems = mappingProblems(settings.mapping, settings.type)
  // Field choices only appear when auto-matching left something to fix, or on request.
  const [showFields, setShowFields] = useState(problems.length > 0)
  const example = (column: number) => file.rows.find((r) => r[column])?.[column] ?? '—'
  const skipped = file.headers.filter((_, i) => settings.mapping[i] === DONT_IMPORT)

  /** Picking a field another column uses moves it there, so a field is never matched twice. */
  function setColumn(column: number, field: string) {
    const mapping = settings.mapping.map((m, i) => {
      if (i === column) return field
      return field !== DONT_IMPORT && m === field ? DONT_IMPORT : m
    })
    onChange({ ...settings, mapping })
  }

  return (
    <div className="space-y-6">
      <Table className="min-w-[36rem] table-fixed">
        <colgroup>
          <col />
          <col />
          {showFields && <col className="w-56" />}
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Column in your file</TableHead>
            <TableHead>First value</TableHead>
            {showFields && <TableHead>Studio Ledger field</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {file.headers.map((header, column) => (
            <TableRow key={column}>
              <TableCell className="truncate font-medium">{header || `Column ${column + 1}`}</TableCell>
              <TableCell className="truncate text-muted-foreground">{example(column)}</TableCell>
              {showFields && (
                <TableCell>
                  <Select value={settings.mapping[column]} onValueChange={(v) => setColumn(column, v)}>
                    <SelectTrigger className="w-full" aria-label={`Field for ${header || `column ${column + 1}`}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((f) => (
                        <SelectItem key={f.key} value={f.key}>
                          {f.label}
                          {!f.required && <span className="text-muted-foreground">(optional)</span>}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                      <SelectItem value={DONT_IMPORT}>Don't import</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!showFields && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <CircleCheckIcon className="size-4 text-status-paid" aria-hidden />
          <span>
            All columns matched.
            {skipped.length > 0 && (
              <span className="text-muted-foreground">
                {' '}
                {skipped.join(', ')} won't be imported.
              </span>
            )}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowFields(true)}>
            Change matching
          </Button>
        </div>
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
