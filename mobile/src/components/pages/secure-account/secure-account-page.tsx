import { useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { SecureActionOption, TextField } from '@/components/molecules'
import { DetailScreen } from '@/components/templates'
import { useSecureAccount, useSecurityAlert } from '@/hooks'
import {
  resolveSecureAccountError,
  SECURE_ACTION_ICONS,
} from '@/services/security-service'
import type { SecureAccountAction } from '@/services/security-service'
import { colors } from '@/theme/colors'

import type { SecureAccountPageProps } from './types'

export const SecureAccountPage = ({ alertId }: SecureAccountPageProps) => {
  const router = useRouter()
  const { alert, isPending } = useSecurityAlert(alertId)
  const { isSecuring, secureAccount } = useSecureAccount(alertId)
  const [chosen, setChosen] = useState<SecureAccountAction | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const options = alert?.availableActions ?? []
  // Until the user taps an option, the backend's recommended action is selected, as in the design
  const selected =
    chosen ?? options.find((option) => option.isRecommended)?.action ?? null

  const handleContinue = async () => {
    if (!selected) {
      return
    }
    setError(undefined)
    try {
      await secureAccount({ action: selected, password })
      // Replace, so going back from the confirmation cannot reopen this form
      router.replace({
        params: { alertId },
        pathname: '/citizen/security/[alertId]/secured',
      })
    } catch (caught) {
      setError(resolveSecureAccountError(caught))
    }
  }

  if (isPending) {
    return (
      <View
        className="flex-1 items-center justify-center bg-clean-white"
        testID="secure-account-loading"
      >
        <ActivityIndicator color={colors.primaryGreen} size="large" />
      </View>
    )
  }

  return (
    <DetailScreen
      action={
        <View className="gap-3">
          <Button
            disabled={!selected || password === ''}
            isLoading={isSecuring}
            label="Continue"
            onPress={() => void handleContinue()}
            testID="secure-account-continue"
          />
          <Button
            label="Cancel"
            onPress={() => router.back()}
            testID="secure-account-cancel"
            variant="secondary"
          />
        </View>
      }
      onBack={() => router.back()}
      testID="secure-account"
      title="Secure your account"
    >
      <View className="gap-2">
        <Text variant="h3" className="text-text-primary">
          Choose an action
        </Text>
        <Text variant="sub-sm">
          We recommend securing your account to prevent further unauthorised
          access.
        </Text>
      </View>
      {options.length === 0 ? (
        <Text variant="sub-sm" testID="secure-account-unavailable">
          This alert has already been handled.
        </Text>
      ) : (
        <>
          <View accessibilityRole="radiogroup" className="gap-3">
            {options.map((option) => (
              <SecureActionOption
                description={option.description}
                Icon={SECURE_ACTION_ICONS[option.action]}
                isRecommended={option.isRecommended}
                isSelected={option.action === selected}
                key={option.action}
                onPress={() => setChosen(option.action)}
                testID={`secure-action-${option.action}`}
                title={option.title}
              />
            ))}
          </View>
          {/* The backend re-checks the password before securing (step-up verification) */}
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
            testID="secure-account-password"
            value={password}
          />
        </>
      )}
    </DetailScreen>
  )
}
