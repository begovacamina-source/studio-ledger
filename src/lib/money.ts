import type { Currency } from './types'

/** Parses a dot-decimal amount such as "1200.00" or "54.9" into integer cents. */
export function parseAmountToCents(value: string): number {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim())
  if (!match) throw new Error(`Invalid amount: "${value}"`)
  const [, whole, fraction = ''] = match
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

function groupThousands(digits: string, separator: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

/** Formats integer cents for display: $1,250.00, €1,250.00 or 1.250,00 KM. */
export function formatMoney(cents: number, currency: Currency = 'USD'): string {
  if (!Number.isInteger(cents)) throw new Error(`Amount must be integer cents: ${cents}`)
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = String(Math.floor(abs / 100))
  const fraction = String(abs % 100).padStart(2, '0')

  switch (currency) {
    case 'USD':
      return `${sign}$${groupThousands(whole, ',')}.${fraction}`
    case 'EUR':
      return `${sign}€${groupThousands(whole, ',')}.${fraction}`
    case 'BAM':
      return `${sign}${groupThousands(whole, '.')},${fraction} KM`
  }
}
