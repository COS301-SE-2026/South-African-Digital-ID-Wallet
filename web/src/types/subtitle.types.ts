import type * as React from 'react'

export type SubtitleProps = React.HTMLAttributes<HTMLParagraphElement> & {
  subtitleSize?: 'sm' | 'md' | 'lg'
}
