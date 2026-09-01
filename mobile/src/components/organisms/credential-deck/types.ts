import type { WalletCredential } from '@/services'

export type CredentialDeckProps = {
  credentials: WalletCredential[]
  onSelect: (credential: WalletCredential) => void
  testID?: string
}
