import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '@/App'
import { loadSampleLedger } from '@/data/sample'
import { LEDGER_KEY, SETTINGS_KEY } from '@/lib/storage'
import type { Currency } from '@/lib/types'

// ResizeObserver is used by the chart and Radix but missing from jsdom.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Radix Select uses pointer capture and scrollIntoView, which jsdom lacks.
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}

/**
 * Renders the app at `path`. Records come from browser storage, so the sample
 * data is saved there first unless `empty` is set; `currency` saves a setting.
 */
export function renderApp(path = '/', options: { empty?: boolean; currency?: Currency } = {}) {
  localStorage.clear()
  if (!options.empty) localStorage.setItem(LEDGER_KEY, JSON.stringify(loadSampleLedger()))
  if (options.currency) localStorage.setItem(SETTINGS_KEY, JSON.stringify({ currency: options.currency }))
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
