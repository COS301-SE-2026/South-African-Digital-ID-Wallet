import type { ResolveEmergencyResponse } from '@/services/emergency-service'

export type EmergencyProfileCardProps = {
  profile: ResolveEmergencyResponse
  testID?: string
}
