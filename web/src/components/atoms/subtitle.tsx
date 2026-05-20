import * as React from 'react'
import { cn } from '@/lib/utils'
import type { SubtitleProps } from '@/types/subtitle'

const subtitleSizeClasses: Record<
  NonNullable<SubtitleProps['subtitleSize']>,
  string
> = {
  sm: 'text-sm md:text-base',
  md: 'text-base md:text-lg',
  lg: 'text-lg md:text-xl',
}

export const Subtitle = ({
  subtitleSize = 'md',
  className,
  children,
  ...props
}: SubtitleProps) => {
  return (
    <p
      className={cn(
        'leading-relaxed text-muted-text',
        subtitleSizeClasses[subtitleSize],
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
