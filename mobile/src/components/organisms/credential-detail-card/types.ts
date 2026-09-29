import type { CredentialField } from '@/services'

export type CredentialDetailCardProps = {
  fields: CredentialField[]
  holderName: string
  isVerified: boolean
  issuedBy: string
  testID?: string
  title: string
}
