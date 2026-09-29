import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md bg-muted-foreground/15 motion-safe:animate-pulse',
        className
      )}
      {...props}
    />
  )
}
