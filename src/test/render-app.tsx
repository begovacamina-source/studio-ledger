import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '@/App'

// ResizeObserver is used by the chart and Radix but missing from jsdom.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
