import type { LucideIcon } from 'lucide-react'

export type TrustedDevice = {
  id: string
  name: string
  meta: string
  status: 'Active' | 'Known'
  icon: LucideIcon
}

export type TrustedDeviceResponse = {
  id: string
  deviceName: string
  deviceType: string
  lastKnownCity: string
  lastKnownCountry: string
  lastActive: string
  isCurrentDevice: boolean
  isTrusted: boolean
}
