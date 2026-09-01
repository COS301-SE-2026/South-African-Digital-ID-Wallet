import type { CredentialTone } from '@/theme/credential-tones'

export type CredentialCardProps = {
  height: number
  isVerified?: boolean
  issuedBy: string
  onPress?: () => void
  testID?: string
  title: string
  tone: CredentialTone
}
