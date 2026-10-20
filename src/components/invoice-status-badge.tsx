import { Badge } from '@/components/ui/badge'
import type { DisplayStatus } from '@/lib/calculations'
import { cn } from '@/lib/utils'

const STYLES: Record<DisplayStatus, string> = {
  Paid: 'border-status-paid/30 bg-status-paid/10 text-status-paid',
  Pending: 'border-status-pending/30 bg-status-pending/10 text-status-pending',
  Overdue: 'border-status-overdue/30 bg-status-overdue/10 text-status-overdue',
}

/** Status is always written out, never shown by colour alone. */
export function InvoiceStatusBadge({
  status,
  daysOverdue,
}: {
  status: DisplayStatus
  daysOverdue?: number
}) {
  const label =
    status === 'Overdue' && daysOverdue !== undefined
      ? `Overdue · ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`
      : status
  return (
    <Badge variant="outline" className={cn(STYLES[status])}>
      {label}
    </Badge>
  )
}
