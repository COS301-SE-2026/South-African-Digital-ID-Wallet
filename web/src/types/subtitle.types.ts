import type * as React from 'react'

export interface SubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  subtitleSize?: 'sm' | 'md' | 'lg'
}
