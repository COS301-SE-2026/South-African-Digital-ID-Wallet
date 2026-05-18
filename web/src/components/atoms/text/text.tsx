import { FC } from 'react'

import { cn } from '@/lib/utils'

import type { TextProps } from './types'

const TEXT_BASE_CLASSNAME = 'font-sans'

const TEXT_VARIANT_CLASSNAMES: Record<TextProps['variant'], string> = {
  h1: 'font-bold tracking-tight text-deep-green text-3xl md:text-4xl',
  h2: 'font-bold tracking-tight text-deep-green text-2xl md:text-3xl',
  h3: 'font-bold tracking-tight text-deep-green text-xl md:text-2xl',
  h4: 'font-bold tracking-tight text-deep-green text-lg md:text-xl',
  'sub-sm': 'leading-relaxed text-muted-text text-sm md:text-base',
  'sub-md': 'leading-relaxed text-muted-text text-base md:text-lg',
  'sub-lg': 'leading-relaxed text-muted-text text-lg md:text-xl',
}

export const Text: FC<TextProps> = ({
  children,
  as = 'p',
  variant,
  className,
  dataCy,
  ...rest
}) => {
  const Component = as

  return (
    <Component
      data-cy={dataCy}
      className={cn(
        TEXT_BASE_CLASSNAME,
        TEXT_VARIANT_CLASSNAMES[variant],
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  )
}
