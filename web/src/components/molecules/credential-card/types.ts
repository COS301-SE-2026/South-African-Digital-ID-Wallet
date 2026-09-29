import { LucideIcon } from 'lucide-react'

export type CredentialCardProps = {
  icon: LucideIcon
  title: string
  description: string
  activated: boolean
  onToggle: (activated: boolean) => void
}
