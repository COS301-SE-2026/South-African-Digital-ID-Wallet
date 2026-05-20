import * as React from 'react'
import { cn } from '@/lib/utils'
import type { TitleProps } from '@/types/title'

const titleSizeClasses: Record<NonNullable<TitleProps['titleSize']>, string> = {
  h1: 'text-3xl md:text-4xl',
  h2: 'text-2xl md:text-3xl',
  h3: 'text-xl md:text-2xl',
  h4: 'text-lg md:text-xl',
}

export const Title = ({
  titleSize = 'h1',
  className,
  children,
  ...props
}: TitleProps) => {
  const Comp = titleSize

  return (
    <Comp
      className={cn(
        'font-bold tracking-tight text-deep-green',
        titleSizeClasses[titleSize],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
