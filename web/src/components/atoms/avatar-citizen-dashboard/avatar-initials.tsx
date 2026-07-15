import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarInitialsProps {
  initials: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeStyles: Record<NonNullable<AvatarInitialsProps['size']>, string> = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
}

export function AvatarInitials({
  initials,
  size = 'md',
  className,
}: AvatarInitialsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary font-bold text-white',
        sizeStyles[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
