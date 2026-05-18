import { ReactNode } from 'react'

export type BaseTextProps = {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'sub-sm' | 'sub-md' | 'sub-lg'
  className?: string
  dataCy?: string
  id?: string
  children?: ReactNode
}

export type TextProps = BaseTextProps &
  (
    | {
        as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
      }
    | {
        as: 'a'
        href: string
      }
  )
