import type { LucideIcon } from 'lucide-react'

export type OfficialActivityEventType =
  | 'OnboardCitizen'
  | 'OnboardCitizenFailed'
  | 'DriverLicenseIssued'
  | 'QrCodeVerified'
export interface OfficialActivityItem {
  id: string
  eventType: OfficialActivityEventType
  details: string
  createdAt: string
}
export type OfficialActivityTone = 'green' | 'blue' | 'amber' | 'red'
export interface OfficialActivityLogItem {
  id: string
  details: string
  timestamp: string
  icon: LucideIcon
  tone: OfficialActivityTone
}
export interface ActivityCardProps {
  activity: OfficialActivityItem[]
}
