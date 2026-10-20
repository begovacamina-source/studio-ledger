import { useState } from 'react'
import { CardList, CardListItem, CardListLine } from '@/components/card-list'
import { ListPagination } from '@/components/list-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FIELDS,
  type ImportSettings,
  type ValidatedRow,
  type ValidationResult,
} from '@/lib/csv-import'
import { plural } from '@/lib/format'
import { paginate } from '@/lib/pagination'
import { useIsMobile } from '@/hooks/use-mobile'


// Short, predictable values get fixed widths; client and description share the rest.
const COLUMN_WIDTH: Record<string, string | undefined> = {
  date: 'w-28',
  amount: 'w-24',
  category: 'w-28',
  invoiceNumber: 'w-28',
}

function RowStatus({ row }: { row: ValidatedRow }) {
  if (row.status === 'valid') return <Badge variant="secondary">Valid</Badge>
  if (row.status === 'duplicate') return <Badge variant="secondary">Duplicate</Badge>
  return <Badge variant="destructive">Error</Badge>
}

export function PreviewStep({
  settings,
  result,
  onBack,
  onCancel,
  onImport,
}: {
  settings: ImportSettings
  result: ValidationResult
  onBack: () => void
  onCancel: () => void
  onImport: () => void
}) {
  const phone = useIsMobile()
  // Every row of the file can be checked, a page at a time.
  const [page, setPage] = useState(1)
  const shown = paginate(result.rows, page)
  const fields = FIELDS[settings.type].filter((f) => settings.mapping.includes(f.key))
  const summary: [string, number][] = [
    ['Valid rows', result.valid],
    ['Rows with errors', result.withErrors],
    ['Duplicates', result.duplicates],
  ]

  return (
    <div className="space-y-6">
      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
        {summary.map(([label, count]) => (
          <Card key={label} className="bg-muted/50 shadow-none">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">{count}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">
          {plural(result.rows.length, 'row')} in your file
        </h2>
        {phone ? (
          // On phones each file row is a short list of its fields, with its status on top.
          <CardList aria-label="Preview rows">
            {shown.items.map((row) => (
              <CardListItem key={row.row}>
                <CardListLine>
                  <span className="font-medium tabular-nums">Row {row.row}</span>
                  <RowStatus row={row} />
                </CardListLine>
                <dl className="grid grid-cols-3 gap-x-4 gap-y-1">
                  {fields.map((f) => (
                    <div key={f.key} className="col-span-3 grid grid-cols-subgrid">
                      <dt className="text-muted-foreground">{f.label}</dt>
                      <dd className="col-span-2 truncate">
                        {row.values[f.key] || <span className="text-muted-foreground">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardListItem>
            ))}
          </CardList>
        ) : (
          <Table className="min-w-[48rem] table-fixed">
            <colgroup>
              <col className="w-14" />
              {fields.map((f) => (
                <col key={f.key} className={COLUMN_WIDTH[f.kind === 'text' ? f.key : f.kind]} />
              ))}
              <col className="w-28" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                {fields.map((f) => (
                  <TableHead key={f.key}>{f.label}</TableHead>
                ))}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.items.map((row) => (
                <TableRow key={row.row}>
                  <TableCell className="text-muted-foreground tabular-nums">{row.row}</TableCell>
                  {fields.map((f) => (
                    <TableCell key={f.key} className="truncate" title={row.values[f.key] || undefined}>
                      {row.values[f.key] || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  ))}
                  <TableCell>
                    <RowStatus row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {/* The import steps aren't in the URL, so this page is kept in state. */}
        <ListPagination page={shown} noun="rows" hrefFor={() => '#'} onPageChange={setPage} />
      </div>

      {result.errors.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Problems to fix in your file</h2>
          <ul className="max-h-60 space-y-1 overflow-y-auto rounded-lg bg-muted/50 p-4 text-sm">
            {result.errors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {result.duplicates > 0 && (
        <p className="text-sm text-muted-foreground">
          {plural(result.duplicates, 'duplicate')} will be skipped:{' '}
          {settings.type === 'invoices'
            ? 'the invoice number already exists.'
            : 'an expense with the same date, amount and description already exists.'}
        </p>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel and fix the file
          </Button>
          {result.valid > 0 ? (
            <Button onClick={onImport}>
              Import {plural(result.valid, 'valid row')}
            </Button>
          ) : (
            <p className="self-center text-sm text-muted-foreground">No valid rows to import.</p>
          )}
        </div>
      </div>
    </div>
  )
}
