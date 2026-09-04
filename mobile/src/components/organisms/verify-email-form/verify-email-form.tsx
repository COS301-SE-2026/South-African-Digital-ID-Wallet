import { useState } from 'react'
import { ShieldCheck } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { useCountdown } from '@/hooks'
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from '@/services/register-service'

import type { VerifyEmailFormProps } from './types'

const INITIAL_VALUES: VerifyEmailFormData = { otp: '' }
const RESEND_COOLDOWN_MS = 60_000

export const VerifyEmailForm = ({
  email,
  onCancel,
  onResend,
  onVerify,
  submitError,
  testID = 'verify-email-form',
}: VerifyEmailFormProps) => {
  const [cooldownUntil, setCooldownUntil] = useState<string>()
  const secondsLeft = useCountdown(cooldownUntil)

  const handleResend = async () => {
    setCooldownUntil(new Date(Date.now() + RESEND_COOLDOWN_MS).toISOString())
    await onResend()
  }

  return (
    <Form
      initialValues={INITIAL_VALUES}
      onSubmitForm={({ otp }) => onVerify(otp)}
      validationSchema={verifyEmailSchema}
    >
      <View className="gap-4" testID={testID}>
        <Text variant="sub-md">
          We emailed a 6-digit code to {email}. Enter it to activate your
          account.
        </Text>
        <TextField
          accessibilityLabel="Verification code"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          label="Verification code:"
          LeftIcon={ShieldCheck}
          maxLength={6}
          name="otp"
          placeholder=""
          textContentType="oneTimeCode"
        />
        {submitError ? (
          <Text
            accessibilityRole="alert"
            variant="caption"
            className="text-center text-danger-red"
          >
            {submitError}
          </Text>
        ) : null}
        <Button
          label="Verify email"
          testID="verify-email-submit"
          type="submit"
        />
        <View className="flex-row items-center justify-center pt-2">
          <Text variant="sub-sm">Didn&apos;t get a code? </Text>
          <Pressable
            accessibilityRole="button"
            disabled={secondsLeft > 0}
            hitSlop={6}
            onPress={() => void handleResend()}
          >
            <Text
              variant="sub-sm"
              className={
                secondsLeft > 0
                  ? 'font-bold text-neutral-mid-grey'
                  : 'font-bold text-primary-green'
              }
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          className="self-center"
          hitSlop={6}
          onPress={onCancel}
        >
          <Text variant="caption" className="font-semibold text-primary-green">
            Use a different email
          </Text>
        </Pressable>
      </View>
    </Form>
  )
}
