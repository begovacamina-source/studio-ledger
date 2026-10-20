import { DatabaseIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
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
import { describeRecords, hasRecords } from '@/lib/storage'
import { useLedger } from '@/state/use-ledger'

/** "Load sample data", with a confirmation first when records already exist. */
export function LoadSampleButton({ variant = 'outline' }: { variant?: ComponentProps<typeof Button>['variant'] }) {
  const { ledger, loadSampleData } = useLedger()

  function load() {
    const error = loadSampleData()
    if (error) toast.error(error)
    else toast.success('Sample data loaded')
  }

  const button = (
    <Button variant={variant} onClick={hasRecords(ledger) ? undefined : load}>
      <DatabaseIcon /> Load sample data
    </Button>
  )
  if (!hasRecords(ledger)) return button

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace your records with the sample data?</AlertDialogTitle>
          <AlertDialogDescription>
            Your {describeRecords(ledger)} will be replaced by the fictional sample: 6 clients, 41
            invoices and 120 expenses from April to September 2026. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={load}>Replace with sample data</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
