import { useState } from 'react'
import { ShieldAlert } from 'lucide-react-native'
import { TextInput, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { BreakGlassGateProps } from './types'

const MIN_REASON_LENGTH = 10

export const BreakGlassGate = ({
  error,
  isSubmitting = false,
  isOffline = false,
  onCancel,
  onConfirm,
  testID = 'break-glass-gate',
}: BreakGlassGateProps) => {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const isTooShort = trimmed.length < MIN_REASON_LENGTH

  return (
    <View className="gap-4 py-2" testID={testID}>
      <View className="items-center gap-3 rounded-3xl border border-border-grey bg-cream-background p-6">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-danger-red/10">
          <ShieldAlert size={26} color={colors.danger} />
        </View>
        <Text variant="h3" className="text-center text-text-primary">
          You are opening a medical record
        </Text>
        <Text variant="sub-sm" className="text-center">
          This person has not unlocked their phone for you. FlashID will record
          your name, your institution, the time and the reason you give below,
          and will tell the citizen and their emergency contacts that you opened
          it
          {isOffline ? ' as soon as this phone is back online.' : '.'}
        </Text>
      </View>

      <View className="gap-2">
        <Text variant="label" className="text-text-primary">
          Why are you opening this profile?
        </Text>
        <TextInput
          accessibilityLabel="Reason for emergency access"
          className="min-h-[96px] rounded-xl border border-border-grey bg-clean-white p-4 text-base text-text-primary"
          multiline
          onChangeText={setReason}
          placeholder="Unconscious patient, ambulance callout..."
          placeholderTextColor={colors.textMuted}
          testID="break-glass-reason"
          textAlignVertical="top"
          value={reason}
        />
        {isTooShort && trimmed.length > 0 ? (
          <Text variant="caption" className="text-warning-amber">
            Give a little more detail — this is read by the citizen afterwards.
          </Text>
        ) : null}
      </View>

      {error ? (
        <Text
          variant="sub-sm"
          className="text-danger-red"
          testID="break-glass-error"
        >
          {error}
        </Text>
      ) : null}

      <View className="gap-3 pt-2">
        <Button
          disabled={isTooShort || isSubmitting}
          isLoading={isSubmitting}
          label="Confirm and open profile"
          onPress={() => onConfirm(trimmed)}
          testID="break-glass-confirm"
          variant="danger"
        />
        <Button
          disabled={isSubmitting}
          label="Cancel"
          onPress={onCancel}
          testID="break-glass-cancel"
          variant="text"
        />
      </View>
    </View>
  )
}
