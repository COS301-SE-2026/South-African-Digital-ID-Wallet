import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import { ShieldAlert } from 'lucide-react-native'
import { ActivityIndicator, View } from 'react-native'
import { Button, Card, Divider, Text } from '@/components/atoms'
import { SectionHeader, SecurityDetailRow } from '@/components/molecules'
import { SecurityAlertBanner, TravelRouteCard } from '@/components/organisms'
import type { TravelPoint } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'
import { useSecurityAlert } from '@/hooks'
import {
  formatSecurityTime,
  toEventDetails,
  toRiskBadge,
  toTravelPointCaption,
  toTravelStats,
} from '@/services/security-service'
import type {
  FraudAlertDetailsResponse,
  SecurityLocationResponse,
} from '@/services/security-service'
import { colors } from '@/theme/colors'
import type { SecurityEventPageProps } from './types'

const IMPOSSIBLE_TRAVEL_WARNING =
  'Nobody could make this trip in that time, even on a commercial flight. Someone else may be using your account.'

const resolutionMessage = (alert: FraudAlertDetailsResponse): string => {
  const when = alert.resolvedAt
    ? ` on ${formatSecurityTime(alert.resolvedAt)}`
    : ''
  return alert.status === 'Dismissed'
    ? `You confirmed this activity was you${when}.`
    : `You secured your account${when}.`
}

const toTravelPoint = (location: SecurityLocationResponse): TravelPoint => ({
  caption: toTravelPointCaption(location),
  label: location.label,
  latitude: location.latitude,
  longitude: location.longitude,
  name: location.city ?? location.label,
})

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
      <DetailScreen onBack={handleBack} title="Security event">
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
        isOpen ? (
          <View className="gap-3">
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
            <Button
              label="This was legitimate activity"
              onPress={() =>
                router.push({
                  params: { alertId },
                  pathname: '/citizen/security/[alertId]/dismiss',
                })
              }
              testID="legitimate-activity-button"
              variant="secondary"
            />
          </View>
        ) : (
          <Button
            label="View all activity"
            onPress={() => router.dismissTo('/citizen/security')}
            testID="view-all-activity-button"
            variant="secondary"
          />
        )
      }
      onBack={handleBack}
      testID="security-event"
      title="Security event"
    >
      <SecurityAlertBanner
        badge={toRiskBadge(alert.riskLevel)}
        footer={[`Risk score: ${alert.riskScore}/100`]}
        message={isOpen ? alert.message : resolutionMessage(alert)}
        title={alert.title}
        tone={isOpen ? 'danger' : 'success'}
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
          from={toTravelPoint(alert.previousLocation)}
          stats={toTravelStats(alert)}
          to={toTravelPoint(alert.suspiciousLocation)}
          warning={
            alert.isImpossibleTravel ? IMPOSSIBLE_TRAVEL_WARNING : undefined
          }
        />
      ) : null}
      {alert.signals.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="Why we flagged this" />
          <Card className="py-1">
            {alert.signals.map((signal, index) => (
              <View key={signal.code}>
                {index > 0 ? <Divider /> : null}
                <SecurityDetailRow
                  Icon={ShieldAlert}
                  label={signal.description}
                  testID={`security-signal-${signal.code}`}
                  value={`Adds ${signal.weight} to the risk score`}
                />
              </View>
            ))}
          </Card>
        </View>
      ) : null}
    </DetailScreen>
  )
}
