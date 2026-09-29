import { useLocalSearchParams } from 'expo-router'

import { SecurityConfirmationPage } from '@/components/pages'

export default function SecurityConfirmationScreen() {
  const { alertId, passwordUpdated } = useLocalSearchParams<{
    alertId: string
    passwordUpdated?: string
  }>()
  return (
    <SecurityConfirmationPage
      alertId={alertId}
      isPasswordUpdated={passwordUpdated === 'true'}
    />
  )
}
