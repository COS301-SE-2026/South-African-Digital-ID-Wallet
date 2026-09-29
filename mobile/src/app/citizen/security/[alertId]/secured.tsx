import { useLocalSearchParams } from 'expo-router'

import { SecurityConfirmationPage } from '@/components/pages'

export default function SecurityConfirmationScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>()
  return <SecurityConfirmationPage alertId={alertId} />
}
