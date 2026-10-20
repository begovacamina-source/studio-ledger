import { MenuIcon, SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Route, Routes, useMatch } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
]

/** The main tabs: a row in the top bar from md up, a stacked list in the phone menu. */
function NavLinks({ stacked = false, onNavigate }: { stacked?: boolean; onNavigate?: () => void }) {
  return NAV.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
          stacked && 'px-4 py-3 text-base',
          isActive && 'bg-muted font-medium text-foreground',
        )
      }
    >
      {item.label}
    </NavLink>
  ))
}

/** Below md the tabs don't fit, so a menu button opens them in a sheet from the top. */
function PhoneMenu() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="md:hidden">
        <SheetHeader>
          <SheetTitle>Studio Ledger</SheetTitle>
          <SheetDescription className="sr-only">Go to a section of Studio Ledger</SheetDescription>
        </SheetHeader>
        <nav aria-label="Main" className="flex flex-col gap-1 px-2 pb-4">
          <NavLinks stacked onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}

/**
 * The gear at the far right of the top bar. The active style is worked out
 * here because the tooltip trigger would drop NavLink's className function.
 */
function SettingsLink() {
  const active = useMatch('/settings')
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/settings"
          aria-label="Settings"
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            active && 'bg-muted text-foreground',
          )}
        >
          <SettingsIcon className="size-4" aria-hidden />
        </Link>
      </TooltipTrigger>
      <TooltipContent>Settings</TooltipContent>
    </Tooltip>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <LedgerProvider>
        <TooltipProvider>
          <div className="min-h-svh bg-muted/40">
            <header className="border-b bg-background">
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
                <span className="truncate font-heading font-semibold">Studio Ledger</span>
                <nav aria-label="Main" className="hidden gap-1 md:flex">
                  <NavLinks />
                </nav>
                {/* Settings sits apart from the main tabs, as an icon on the far right. */}
                <div className="flex items-center justify-end gap-1">
                  <PhoneMenu />
                  <SettingsLink />
                </div>
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
