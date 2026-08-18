import { FC } from 'react'
import { cn } from '@/lib/utils'
import type { AvatarProps } from './types'

export const Avatar: FC<AvatarProps> = ({
  initials,
  className,
  dataCy,
  ...rest
}) => {
  return (
    <div
      data-cy={dataCy}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green/10 font-sans text-sm font-semibold text-primary-green',
        className
      )}
      {...rest}
    >
      {initials}
    </div>
  )
}
