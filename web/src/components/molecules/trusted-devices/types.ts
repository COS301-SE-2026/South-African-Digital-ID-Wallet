export type TrustedDeviceItem = {
  id: string
  name: string
  lastSeen: string
}

export type TrustedDevicesProps = {
  devices?: TrustedDeviceItem[]
}
