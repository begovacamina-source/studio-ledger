import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * On phones, data tables become a list of rows like this one: a stack of lines
 * per record, divided by hairlines, bleeding to the card's edges.
 */
export function CardList({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('-my-2 divide-y divide-border/60', className)} {...props} />
}

export function CardListItem({
  selected,
  className,
  ...props
}: ComponentProps<'li'> & { selected?: boolean }) {
  return (
    <li
      data-state={selected ? 'selected' : undefined}
      className={cn(
        '-mx-6 grid gap-1.5 px-6 py-4 text-sm data-[state=selected]:bg-muted',
        props.onClick && 'cursor-pointer',
        className,
      )}
      {...props}
    />
  )
}

/** One line of a card list row: main content on the left, a figure or badge on the right. */
export function CardListLine({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 items-center justify-between gap-3', className)} {...props} />
}
