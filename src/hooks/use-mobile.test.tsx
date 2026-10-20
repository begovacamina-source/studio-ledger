import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LG_BREAKPOINT, useIsBelow, useIsMobile } from './use-mobile'

describe('useIsBelow', () => {
  it('reads the width on the first render and follows width changes', () => {
    const listeners: (() => void)[] = []
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          addEventListener: (_: string, fn: () => void) => listeners.push(fn),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    )
    window.innerWidth = 1280
    const { result } = renderHook(() => ({ tablet: useIsBelow(LG_BREAKPOINT), phone: useIsMobile() }))
    expect(result.current).toEqual({ tablet: false, phone: false })

    window.innerWidth = 800
    act(() => listeners.forEach((fn) => fn()))
    expect(result.current).toEqual({ tablet: true, phone: false })

    window.innerWidth = 375
    act(() => listeners.forEach((fn) => fn()))
    expect(result.current).toEqual({ tablet: true, phone: true })
  })
})
