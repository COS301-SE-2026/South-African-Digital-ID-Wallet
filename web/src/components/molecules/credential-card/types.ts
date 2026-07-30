import { LucideIcon } from 'lucide-react'

export type CredentialCardProps = {
  icon: LucideIcon
  title: string
  description: string
  available: boolean
  activated: boolean
  onToggle: (activated: boolean) => void
}
