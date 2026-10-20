/** Period change as a whole percentage, e.g. "+12%", or "—" when there is no previous value. */
export function formatChange(change: number | null): string {
  if (change === null) return '—'
  const rounded = Math.round(change)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

/** "1 invoice", "3 invoices". */
export function plural(count: number, word: string): string {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`
}
