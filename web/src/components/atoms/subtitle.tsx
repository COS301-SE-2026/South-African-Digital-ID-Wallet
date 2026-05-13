import * as React from 'react'
import { cn } from '@/lib/utils'

type SubtitleProps = React.HTMLAttributes<HTMLParagraphElement> & {
  subtitleSize?: 'sm' | 'md' | 'lg'
}

const subtitleSizeClasses: Record<
  NonNullable<SubtitleProps['subtitleSize']>,
  string
> = {
  sm: 'text-sm md:text-base',
  md: 'text-base md:text-lg',
  lg: 'text-lg md:text-xl',
}

export function Subtitle({
  subtitleSize = 'md',
  className,
  children,
  ...props
}: SubtitleProps) {
  return (
    <p
      className={cn(
        'leading-relaxed text-slate-600',
        subtitleSizeClasses[subtitleSize],
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
