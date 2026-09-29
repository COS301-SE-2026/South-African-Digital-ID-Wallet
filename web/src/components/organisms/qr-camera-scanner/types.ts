export type CameraState = 'requesting' | 'active' | 'denied' | 'unavailable'

export type QrCameraScannerProps = {
  onScan: (rawText: string) => void
  paused?: boolean
}
