import { CircleCheckIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { ImportOutcome, RecordType } from '@/lib/csv-import'
import { plural } from '@/lib/format'


export function ResultStep({
  type,
  outcome,
  onImportAnother,
}: {
  type: RecordType
  outcome: ImportOutcome
  onImportAnother: () => void
}) {
  const noun = type === 'invoices' ? 'invoice' : 'expense'
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <CircleCheckIcon className="size-10 text-status-paid" aria-hidden />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{plural(outcome.imported, noun)} imported</h2>
        <p className="text-muted-foreground">
          {outcome.skipped === 0
            ? 'No rows were skipped.'
            : `${plural(outcome.skipped, 'row')} skipped (errors or duplicates).`}
        </p>
        {outcome.clientsCreated.length > 0 && (
          <p className="text-muted-foreground">
            New {outcome.clientsCreated.length === 1 ? 'client' : 'clients'}:{' '}
            {outcome.clientsCreated.join(', ')}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">Go to Overview</Link>
        </Button>
        <Button variant="outline" onClick={onImportAnother}>
          Import another file
        </Button>
      </div>
    </div>
  )
}
