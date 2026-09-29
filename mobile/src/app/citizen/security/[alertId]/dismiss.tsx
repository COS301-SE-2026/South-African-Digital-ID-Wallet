import { useLocalSearchParams } from 'expo-router'

import { DismissAlertPage } from '@/components/pages'

export default function DismissAlertScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>()
  return <DismissAlertPage alertId={alertId} />
}
