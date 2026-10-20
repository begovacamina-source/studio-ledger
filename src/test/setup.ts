import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { toast } from 'sonner'
import { afterAll, afterEach, vi } from 'vitest'

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
  // Sonner keeps its toasts in a module-level store; clear them so tests don't share them.
  toast.dismiss()
  localStorage.clear()
  window.innerWidth = DESKTOP_WIDTH
})

// Sonner unmounts a dismissed toast 200 ms later, on a timer. Let that finish before the
// test file's environment is torn down, or it fires with no window ("window is not defined").
afterAll(async () => {
  vi.useRealTimers()
  await new Promise((resolve) => setTimeout(resolve, 300))
})
