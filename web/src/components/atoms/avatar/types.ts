import { HTMLAttributes } from 'react'

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  initials: string
  dataCy?: string
}
