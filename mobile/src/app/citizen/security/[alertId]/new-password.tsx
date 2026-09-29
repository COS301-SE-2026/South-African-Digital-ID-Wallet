import { useLocalSearchParams } from 'expo-router'

import { SecurityNewPasswordPage } from '@/components/pages'

export default function SecurityNewPasswordScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>()
  return <SecurityNewPasswordPage alertId={alertId} />
}
