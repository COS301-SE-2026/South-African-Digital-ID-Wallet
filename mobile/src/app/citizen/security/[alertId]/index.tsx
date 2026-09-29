import { useLocalSearchParams } from 'expo-router'

import { SecurityEventPage } from '@/components/pages'

export default function SecurityEventScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>()
  return <SecurityEventPage alertId={alertId} />
}
