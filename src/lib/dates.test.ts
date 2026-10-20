import { describe, expect, it } from 'vitest'
import { todayLocal } from './dates'

// PRD edge case: "Today" uses the user's local date.
describe('todayLocal', () => {
  it('uses the local calendar date, not UTC', () => {
    // 23:30 and 00:30 local time are on different UTC dates in most time zones;
    // the result must follow the local clock either way.
    expect(todayLocal(new Date(2026, 9, 19, 23, 30))).toBe('2026-10-19')
    expect(todayLocal(new Date(2026, 9, 20, 0, 30))).toBe('2026-10-20')
  })

  it('pads single-digit months and days', () => {
    expect(todayLocal(new Date(2026, 0, 5, 12))).toBe('2026-01-05')
  })
})
