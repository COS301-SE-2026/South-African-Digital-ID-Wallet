import type { AccountResponse, ProfileResponse } from '@/services'

export type PersonalInfoSheetProps = {
  account: AccountResponse | null
  isVisible: boolean
  onClose: () => void
  profile: ProfileResponse | null
}
