import type { WalletCredential } from '@/services'

export type CredentialListProps = {
  credentials: WalletCredential[]
  onSelect: (credential: WalletCredential) => void
  testID?: string
}
