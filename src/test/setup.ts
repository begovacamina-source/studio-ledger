import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no matchMedia; useIsMobile only needs it to listen for width changes.
// Tests run at jsdom's 1024 px width (desktop) unless they set window.innerWidth.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
const DESKTOP_WIDTH = window.innerWidth

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.innerWidth = DESKTOP_WIDTH
})
