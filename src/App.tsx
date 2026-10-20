import { MenuIcon, SettingsIcon } from 'lucide-react'
import { Link, NavLink, Route, Routes, useMatch } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Toaster } from '@/components/ui/sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ClientsPage } from '@/pages/clients-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { ExpensesPage } from '@/pages/expenses-page'
import { ImportPage } from '@/pages/import-page'
import { InvoicesPage } from '@/pages/invoices-page'
import { SettingsPage } from '@/pages/settings-page'
import { LedgerProvider } from '@/state/ledger-provider'
import { SettingsProvider } from '@/state/settings-provider'
import { UndoProvider } from '@/state/undo-provider'

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/invoices', label: 'Invoices', end: false },
  { to: '/clients', label: 'Clients', end: false },
  { to: '/expenses', label: 'Expenses', end: false },
  { to: '/import', label: 'Import', end: false },
]

/** The main tabs as a row in the top bar, from md up. */
function NavLinks() {
  return NAV.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none',
          isActive && 'bg-muted font-medium text-foreground',
        )
      }
    >
      {item.label}
    </NavLink>
  ))
}

/** One phone menu item; the current page is marked for sight and for screen readers. */
function PhoneMenuItem({ to, end, label }: { to: string; end: boolean; label: string }) {
  const active = useMatch({ path: to, end })
  return (
    <DropdownMenuItem asChild className={cn('px-3 py-2', active && 'bg-muted font-medium')}>
      <Link to={to} aria-current={active ? 'page' : undefined}>
        {label}
      </Link>
    </DropdownMenuItem>
  )
}

/**
 * Below md the tabs don't fit, so a menu button on the left opens them in a
 * dropdown, with Settings as plain text below a divider.
 */
function PhoneMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="-ml-2 md:hidden" aria-label="Open menu">
          <MenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {NAV.map((item) => (
          <PhoneMenuItem key={item.to} {...item} />
        ))}
        <DropdownMenuSeparator />
        <PhoneMenuItem to="/settings" end label="Settings" />
      </DropdownMenuContent>
    </DropdownMenu>
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
            'flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none',
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
        <UndoProvider>
          <TooltipProvider>
            <div className="min-h-svh bg-muted/60">
              <header className="bg-background">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]">
                  <div className="flex min-w-0 items-center gap-1">
                    <PhoneMenu />
                    <span className="truncate font-heading font-semibold">Studio Ledger</span>
                  </div>
                  <nav aria-label="Main" className="hidden gap-1 md:flex">
                    <NavLinks />
                  </nav>
                  {/* From md up, Settings sits apart from the main tabs, as an icon on the far right.
                      On phones it is the last item in the menu instead. */}
                  <div className="hidden justify-end md:flex">
                    <SettingsLink />
                  </div>
                </div>
              </header>
              <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                <Routes>
                  <Route index element={<DashboardPage />} />
                  {/* One route, so the list keeps its state while the invoice panel opens and closes. */}
                  <Route path="invoices/:invoiceNumber?" element={<InvoicesPage />} />
                  {/* One route, so the list keeps its state while the client panel opens and closes. */}
                  <Route path="clients/:clientId?" element={<ClientsPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="import" element={<ImportPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Routes>
              </main>
              {/* Top centre, so toasts never cover the invoice panel's actions. */}
              <Toaster position="top-center" />
            </div>
          </TooltipProvider>
        </UndoProvider>
      </LedgerProvider>
    </SettingsProvider>
  )
}
