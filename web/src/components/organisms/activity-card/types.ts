import { LucideIcon } from 'lucide-react'

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
export interface OfficialActivityLogItem {
  id: string
  details: string
  timestamp: string
  icon: LucideIcon
  tone: 'green' | 'blue' | 'amber' | 'red'
}
