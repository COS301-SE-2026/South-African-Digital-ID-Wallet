export type LinkedDeviceRowProps = {
  isCurrent: boolean
  isUnlinking?: boolean
  lastActive: string
  location: string
  name: string
  onUnlink: () => void
  testID?: string
}
