import { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

export type CredentialResponse = {
  id: string
  type: string
  title: string
  issuedBy: string
  status: string
  issueDate: string
}

export type ActivityResponse = {
  id: string
  title: string
  timestamp: string
  type: string
}

export type IdentityStatus = 'verified' | 'pending' | 'attention'

export type IdentityStatusSummary = {
  description: string
  label: string
  status: IdentityStatus
  tone: IconTileTone
  value: string
}

export type ActivityEntry = {
  description: string
  id: string
  Icon: LucideIcon
  timestamp: string
  title: string
  tone: IconTileTone
}
