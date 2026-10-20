import { describe, expect, it } from 'vitest'
import { formatChange } from './format'

describe('formatChange', () => {
  it('shows "—" when there is no previous value', () => {
    expect(formatChange(null)).toBe('—')
  })

  it('rounds to a whole percentage with a sign', () => {
    expect(formatChange(12.4)).toBe('+12%')
    expect(formatChange(-20.87)).toBe('-21%')
    expect(formatChange(0)).toBe('0%')
  })
})
