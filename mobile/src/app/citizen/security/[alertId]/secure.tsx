import { useLocalSearchParams } from 'expo-router'

import { SecureAccountPage } from '@/components/pages'

export default function SecureAccountScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>()
  return <SecureAccountPage alertId={alertId} />
}
