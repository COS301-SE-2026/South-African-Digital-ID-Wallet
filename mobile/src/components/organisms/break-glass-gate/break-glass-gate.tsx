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
  onCancel,
  onConfirm,
  testID = 'break-glass-gate',
}: BreakGlassGateProps) => {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const isTooShort = trimmed.length < MIN_REASON_LENGTH

  return (
    <View className="flex-1 gap-4 px-6 py-6" testID={testID}>
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-danger-red/15">
        <ShieldAlert size={26} color={colors.danger} />
      </View>

      <Text variant="h3" className="text-clean-white">
        You are opening a medical record
      </Text>

      <Text variant="sub-sm" className="text-clean-white/70">
        This person has not unlocked their phone for you. FlashID will record
        your name, your institution, the time and the reason you give below, and
        will tell the citizen and their emergency contacts that you opened it.
      </Text>

      <View className="gap-2">
        <Text variant="sub-sm" className="text-clean-white">
          Why are you opening this profile?
        </Text>
        <TextInput
          accessibilityLabel="Reason for emergency access"
          className="min-h-[96px] rounded-2xl bg-clean-white/10 p-4 text-clean-white"
          multiline
          onChangeText={setReason}
          placeholder="Unconscious patient, ambulance callout..."
          placeholderTextColor={colors.neutralMidGrey}
          testID="break-glass-reason"
          textAlignVertical="top"
          value={reason}
        />
        {isTooShort && trimmed.length > 0 ? (
          <Text variant="sub-sm" className="text-warning-amber">
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

      <View className="mt-auto gap-3">
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
