import { describe, expect, it } from 'vitest'
import { formatAxisMoney, formatMoney, parseAmountToCents } from './money'

describe('parseAmountToCents', () => {
  it('parses dot-decimal amounts into integer cents', () => {
    expect(parseAmountToCents('1200.00')).toBe(120000)
    expect(parseAmountToCents('54.99')).toBe(5499)
    expect(parseAmountToCents('59.9')).toBe(5990)
    expect(parseAmountToCents('320')).toBe(32000)
  })

  it('rejects anything that is not a plain amount', () => {
    expect(() => parseAmountToCents('12.345')).toThrow()
    expect(() => parseAmountToCents('-5.00')).toThrow()
    expect(() => parseAmountToCents('')).toThrow()
  })
})

describe('formatMoney', () => {
  it('formats each currency without converting', () => {
    expect(formatMoney(125000, 'USD')).toBe('$1,250.00')
    expect(formatMoney(125000, 'EUR')).toBe('€1,250.00')
    expect(formatMoney(125000, 'BAM')).toBe('1.250,00 KM')
  })

  it('defaults to USD', () => {
    expect(formatMoney(4981000)).toBe('$49,810.00')
  })

  it('shows a minus sign for negative amounts', () => {
    expect(formatMoney(-258487, 'USD')).toBe('-$2,584.87')
    expect(formatMoney(-258487, 'BAM')).toBe('-2.584,87 KM')
  })

  it('formats small amounts', () => {
    expect(formatMoney(0)).toBe('$0.00')
    expect(formatMoney(5)).toBe('$0.05')
  })
})

describe('formatAxisMoney', () => {
  it('drops the cents on whole axis amounts', () => {
    expect(formatAxisMoney(1_400_000, 'USD')).toBe('$14,000')
    expect(formatAxisMoney(1_400_000, 'EUR')).toBe('€14,000')
    expect(formatAxisMoney(1_400_000, 'BAM')).toBe('14.000 KM')
    expect(formatAxisMoney(0, 'BAM')).toBe('0 KM')
  })

  it('keeps BAM on one line with a non-breaking space', () => {
    expect(formatAxisMoney(1_400_000, 'BAM')).not.toMatch(/\s(?<! )/)
  })

  it('keeps cents that are not zero', () => {
    expect(formatAxisMoney(1_250_050, 'BAM')).toBe('12.500,50 KM')
  })
})
