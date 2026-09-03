export type QrCodeCardProps = {
  onCancel: () => void
  onRefresh: () => void
  secondsRemaining: number
  testID?: string
  token: string
}
