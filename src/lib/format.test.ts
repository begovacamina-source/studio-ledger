import { describe, expect, it } from 'vitest'
import { formatChange, plural } from './format'

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

describe('plural', () => {
  it('adds an s for anything but one', () => {
    expect(plural(1, 'invoice')).toBe('1 invoice')
    expect(plural(0, 'row')).toBe('0 rows')
    expect(plural(5000, 'row')).toBe('5,000 rows')
  })
})
