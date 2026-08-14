import type { TextProps as RNTextProps } from 'react-native'

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'sub-sm'
  | 'sub-md'
  | 'sub-lg'
  | 'label'
  | 'caption'

export type TextProps = RNTextProps & {
  className?: string
  variant?: TextVariant
}
