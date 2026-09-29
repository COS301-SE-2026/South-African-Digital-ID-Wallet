import { useState } from 'react'
import { useRouter } from 'expo-router'
import { CircleAlert, UserCheck } from 'lucide-react-native'
import { ActivityIndicator, Pressable, View } from 'react-native'

import { Button, IconTile, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { DetailScreen } from '@/components/templates'
import { useDismissAlert, useSecurityAlert } from '@/hooks'
import {
  formatSecurityTime,
  resolveDismissAlertError,
} from '@/services/security-service'
import { colors } from '@/theme/colors'

import type { DismissAlertPageProps } from './types'

export const DismissAlertPage = ({ alertId }: DismissAlertPageProps) => {
  const router = useRouter()
  const { alert, isError, isPending } = useSecurityAlert(alertId)
  const { dismissAlert, isDismissing } = useDismissAlert(alertId)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const handleConfirm = async () => {
    setError(undefined)
    try {
      await dismissAlert({ password })
      router.dismissTo('/citizen/security')
    } catch (caught) {
      setError(resolveDismissAlertError(caught))
    }
  }

  if (isPending) {
    return (
      <View
        className="flex-1 items-center justify-center bg-clean-white"
        testID="dismiss-alert-loading"
      >
        <ActivityIndicator color={colors.primaryGreen} size="large" />
      </View>
    )
  }

  const isOpen = alert?.status === 'Open'

  return (
    <DetailScreen
      action={
        isOpen ? (
          <View className="gap-3">
            <Button
              disabled={password === ''}
              isLoading={isDismissing}
              label="Yes, this was me"
              onPress={() => void handleConfirm()}
              testID="dismiss-alert-confirm"
            />
            <Button
              label="Cancel"
              onPress={() => router.back()}
              testID="dismiss-alert-cancel"
              variant="secondary"
            />
          </View>
        ) : undefined
      }
      onBack={() => router.back()}
      testID="dismiss-alert"
      title="Confirm it was you"
    >
      {isError || !alert ? (
        <Text
          variant="sub-sm"
          className="text-danger-red"
          testID="dismiss-alert-error"
        >
          We could not load this security event.
        </Text>
      ) : !isOpen ? (
        <Text variant="sub-sm" testID="dismiss-alert-unavailable">
          This alert has already been handled.
        </Text>
      ) : (
        <>
          <View className="items-center gap-3 pt-2">
            <IconTile
              Icon={UserCheck}
              shape="circle"
              size="lg"
              tone="soft-green"
            />
            <Text variant="h3" className="text-center text-text-primary">
              Was this you?
            </Text>
            <Text variant="sub-sm" className="text-center">
              {`If you signed in from ${alert.suspiciousLocationLabel} on ${formatSecurityTime(alert.detectedAt)}, confirm with your password. We'll close this alert and turn QR code sharing back on.`}
            </Text>
          </View>
          <View className="flex-row gap-3 rounded-2xl border border-warning-amber/30 bg-warning-amber/10 p-4">
            <CircleAlert color={colors.warning} size={20} />
            <View className="flex-1 gap-2">
              <Text variant="sub-sm" className="text-text-primary">
                Only confirm if you are sure. If you don&apos;t recognise this
                sign-in, secure your account instead.
              </Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={6}
                onPress={() =>
                  router.replace({
                    params: { alertId },
                    pathname: '/citizen/security/[alertId]/secure',
                  })
                }
                testID="dismiss-alert-secure-instead"
              >
                <Text variant="sub-sm" className="font-bold text-primary-green">
                  Secure my account instead
                </Text>
              </Pressable>
            </View>
          </View>
          <TextField
            autoCapitalize="none"
            autoComplete="current-password"
            error={error}
            label="Confirm your password"
            onChangeText={(value) => {
              setPassword(value)
              setError(undefined)
            }}
            placeholder="Enter your password"
            secure
            testID="dismiss-alert-password"
            value={password}
          />
        </>
      )}
    </DetailScreen>
  )
}
