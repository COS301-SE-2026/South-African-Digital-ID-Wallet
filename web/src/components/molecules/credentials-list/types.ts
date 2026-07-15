import type { LucideIcon } from 'lucide-react'

export type CredentialStatus = 'Verified' | 'Pending' | 'Expired'

export interface Credential {
  id: string
  title: string
  issuer: string
  status: CredentialStatus
  icon: LucideIcon
  tone: 'blue' | 'red' | 'orange' | 'purple' | 'green'
}
