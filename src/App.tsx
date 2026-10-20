import { useMemo } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { loadSampleLedger } from '@/data/sample'
import type { Ledger } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DashboardPage } from '@/pages/dashboard-page'
import { ExpensesPage } from '@/pages/expenses-page'
import { ImportPage } from '@/pages/import-page'
import { InvoicesPage } from '@/pages/invoices-page'
import { LedgerProvider } from '@/state/ledger-provider'

function loadLedger(): { ledger: Ledger } | { error: string } {
  try {
    return { ledger: loadSampleLedger() }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/invoices', label: 'Invoices', end: false },
  { to: '/expenses', label: 'Expenses', end: false },
  { to: '/import', label: 'Import', end: false },
]

export default function App() {
  const result = useMemo(() => loadLedger(), [])
  return (
    <TooltipProvider>
      <div className="min-h-svh bg-muted/40">
        <header className="border-b bg-background">
          <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
            <span className="font-semibold">Studio Ledger</span>
            <nav aria-label="Main" className="flex gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                      isActive && 'bg-muted font-medium text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {'error' in result ? (
            <div role="alert" className="rounded-lg border bg-background p-6 text-sm">
              <p className="font-medium">The sample data could not be loaded.</p>
              <p className="mt-1 text-muted-foreground">{result.error}</p>
            </div>
          ) : (
            <LedgerProvider initial={result.ledger}>
              <Routes>
                <Route index element={<DashboardPage />} />
                {/* One route, so the list keeps its state while the invoice panel opens and closes. */}
                <Route path="invoices/:invoiceNumber?" element={<InvoicesPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="import" element={<ImportPage />} />
              </Routes>
            </LedgerProvider>
          )}
        </main>
        {/* Top centre, so toasts never cover the invoice panel's actions. */}
        <Toaster position="top-center" />
      </div>
    </TooltipProvider>
  )
}
