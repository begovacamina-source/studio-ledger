import { NavLink, Route, Routes } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { DashboardPage } from '@/pages/dashboard-page'
import { ExpensesPage } from '@/pages/expenses-page'
import { ImportPage } from '@/pages/import-page'
import { InvoicesPage } from '@/pages/invoices-page'
import { SettingsPage } from '@/pages/settings-page'
import { LedgerProvider } from '@/state/ledger-provider'
import { SettingsProvider } from '@/state/settings-provider'

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/invoices', label: 'Invoices', end: false },
  { to: '/expenses', label: 'Expenses', end: false },
  { to: '/import', label: 'Import', end: false },
  { to: '/settings', label: 'Settings', end: false },
]

export default function App() {
  return (
    <SettingsProvider>
      <LedgerProvider>
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
              <Routes>
                <Route index element={<DashboardPage />} />
                {/* One route, so the list keeps its state while the invoice panel opens and closes. */}
                <Route path="invoices/:invoiceNumber?" element={<InvoicesPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="import" element={<ImportPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </main>
            {/* Top centre, so toasts never cover the invoice panel's actions. */}
            <Toaster position="top-center" />
          </div>
        </TooltipProvider>
      </LedgerProvider>
    </SettingsProvider>
  )
}
