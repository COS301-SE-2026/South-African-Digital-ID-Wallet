import type { LucideIcon } from 'lucide-react-native'

export type CredentialCardProps = {
  height: number
  hint?: string
  Icon: LucideIcon
  issuedBy: string
  onPress?: () => void
  testID?: string
  title: string
}

export type CredentialPatternIcon = {
  opacity: number
  right: number
  size: number
  strong?: boolean
  top: number
}
