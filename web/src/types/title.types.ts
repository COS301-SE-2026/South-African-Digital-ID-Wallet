import type * as React from 'react'

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4'
}
