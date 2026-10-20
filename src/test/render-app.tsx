import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '@/App'
import { loadSampleLedger } from '@/data/sample'
import { EMPTY_LEDGER, LEDGER_KEY, SETTINGS_KEY } from '@/lib/storage'
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
 * Renders the app at `path`. Records come from browser storage: the sample is
 * saved there first by default; `empty` saves a cleared ledger; `firstVisit`
 * saves nothing, like a browser that has never opened the app. `currency`
 * saves a setting.
 */
export function renderApp(
  path = '/',
  options: { empty?: boolean; firstVisit?: boolean; currency?: Currency } = {},
) {
  localStorage.clear()
  if (options.empty) localStorage.setItem(LEDGER_KEY, JSON.stringify(EMPTY_LEDGER))
  else if (!options.firstVisit) localStorage.setItem(LEDGER_KEY, JSON.stringify(loadSampleLedger()))
  if (options.currency) localStorage.setItem(SETTINGS_KEY, JSON.stringify({ currency: options.currency }))
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
