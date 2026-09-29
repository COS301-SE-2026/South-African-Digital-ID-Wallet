import { Text as RNText } from 'react-native'
import { cn } from '@/lib/utils'
import type { TextProps, TextVariant } from './types'

const VARIANT_CLASSNAMES: Record<TextVariant, string> = {
  h1: 'text-3xl font-bold tracking-tight text-deep-green',
  h2: 'text-2xl font-bold tracking-tight text-deep-green',
  h3: 'text-xl font-bold tracking-tight text-deep-green',
  h4: 'text-lg font-bold tracking-tight text-deep-green',
  'sub-sm': 'text-sm text-muted-text',
  'sub-md': 'text-base text-muted-text',
  'sub-lg': 'text-lg text-muted-text',
  label: 'text-base font-bold text-primary-green',
  caption: 'text-xs text-muted-text',
}

export const Text = ({ className, variant = 'sub-md', ...rest }: TextProps) => (
  <RNText className={cn(VARIANT_CLASSNAMES[variant], className)} {...rest} />
)
