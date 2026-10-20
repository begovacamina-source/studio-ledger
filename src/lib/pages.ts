/** The page each top-level path belongs to. A panel (`/invoices/INV-002`) stays on its page. */
const PAGES: Record<string, string> = {
  '': 'Overview',
  invoices: 'Invoices',
  clients: 'Clients',
  expenses: 'Expenses',
  import: 'Import CSV',
  settings: 'Settings',
}

export function pageName(pathname: string) {
  return PAGES[pathname.split('/')[1] ?? ''] ?? 'Page not found'
}
