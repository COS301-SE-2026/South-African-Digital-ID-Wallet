export type OfficialBadgeSheetProps = {
  isVisible: boolean
  onClose: () => void
  onRefresh: () => void
  secondsRemaining: number
  testID?: string
  token: string | null
}
