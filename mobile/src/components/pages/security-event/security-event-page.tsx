import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { Button, Card, Divider, Text } from '@/components/atoms'
import { SecurityDetailRow } from '@/components/molecules'
import { SecurityAlertBanner, TravelRouteCard } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import { useSecurityAlert } from '@/hooks'
import { toEventDetails } from '@/services/security-service'
import { colors } from '@/theme/colors'
import type { SecurityEventPageProps } from './types'

export const SecurityEventPage = ({ alertId }: SecurityEventPageProps) => {
  const router = useRouter()
  const { alert, isError, isPending } = useSecurityAlert(alertId)
  const handleBack = useCallback(() => router.back(), [router])

  if (isPending) {
    return (
      <View
        className="flex-1 items-center justify-center bg-clean-white"
        testID="security-event-loading"
      >
        <ActivityIndicator color={colors.primaryGreen} size="large" />
      </View>
    )
  }

  if (isError || !alert) {
    return (
      <DetailScreen onBack={handleBack} title="Event details">
        <Text
          variant="sub-sm"
          className="text-danger-red"
          testID="security-event-error"
        >
          We could not load this security event.
        </Text>
      </DetailScreen>
    )
  }

  const isOpen = alert.status === 'Open'

  return (
    <DetailScreen
      action={
        <View className="gap-3">
          {isOpen ? (
            <Button
              label="Secure my account"
              onPress={() =>
                router.push({
                  params: { alertId },
                  pathname: '/citizen/security/[alertId]/secure',
                })
              }
              testID="secure-my-account-button"
            />
          ) : null}
          <Button
            label="View all activity"
            onPress={() => router.dismissTo('/citizen/security')}
            testID="view-all-activity-button"
            variant="secondary"
          />
        </View>
      }
      onBack={handleBack}
      testID="security-event"
      title="Event details"
    >
      <SecurityAlertBanner
        message={
          isOpen
            ? 'This login looks suspicious and may indicate identity fraud.'
            : 'This alert has been resolved.'
        }
        title={alert.title}
      />
      <Card className="py-1">
        {toEventDetails(alert).map((detail, index) => (
          <View key={detail.label}>
            {index > 0 ? <Divider /> : null}
            <SecurityDetailRow
              {...detail}
              testID={`security-detail-${index}`}
            />
          </View>
        ))}
      </Card>
      {alert.previousLocation ? (
        <TravelRouteCard
          from={alert.previousLocation.city ?? alert.previousLocation.label}
          to={alert.suspiciousLocation.city ?? alert.suspiciousLocation.label}
        />
      ) : null}
    </DetailScreen>
  )
}
