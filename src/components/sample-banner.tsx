import { InfoIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { describeRecords, sampleRecords, usesSampleData } from '@/lib/storage'
import { useLedger } from '@/state/use-ledger'

/** A small banner while sample records are in the ledger, with a way to clear them. */
export function SampleBanner() {
  const { ledger, clearSampleData } = useLedger()
  if (!usesSampleData(ledger)) return null

  const sample = sampleRecords(ledger)
  // Invoices or expenses the user added or imported, which clearing keeps.
  const keepsOwn =
    ledger.invoices.length + ledger.expenses.length > sample.invoices.length + sample.expenses.length

  return (
    <div role="status" className="border-b bg-muted">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-sm sm:px-6">
        <InfoIcon className="size-4 text-muted-foreground" aria-hidden />
        <span>You're viewing sample data</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              Clear it
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear the sample data?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes the sample's {describeRecords(sample)}.{' '}
                {keepsOwn
                  ? 'Records you added or imported stay.'
                  : 'You can load it again from Settings.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  clearSampleData()
                  toast.success('Sample data cleared')
                }}
              >
                Clear sample data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
