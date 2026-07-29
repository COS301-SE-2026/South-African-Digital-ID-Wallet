import type { LucideIcon } from 'lucide-react'

export type ManageUserTrustedDevice = {
  id: string
  name: string
  meta: string
  status: 'Active' | 'Known'
  icon: LucideIcon
}

export type ManageUserTrustedDeviceResponse = {
  id: string
  deviceName: string
  deviceType: string
  location: string
  lastActive: string
  isCurrentDevice: boolean
  isTrusted: boolean
}
