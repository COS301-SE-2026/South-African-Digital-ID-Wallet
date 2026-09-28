import type { ReactNode } from 'react'
export type ValidCertifiedCopyProps = {
  citizenName?: string
  maskedId?: string
}
export type DetailRowProps = {
  icon: ReactNode
  label: string
  value: string
  isLast?: boolean
}