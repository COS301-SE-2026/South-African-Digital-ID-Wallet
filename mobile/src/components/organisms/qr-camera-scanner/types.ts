export type QrCameraScannerProps = {
  isTorchOn?: boolean
  onScan: (rawText: string) => void
  paused?: boolean
  testID?: string
}
