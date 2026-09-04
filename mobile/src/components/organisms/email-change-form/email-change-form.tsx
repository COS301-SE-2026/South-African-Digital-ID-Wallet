import { useState } from 'react'
import { KeyRound, Lock, Mail } from 'lucide-react-native'
import { Pressable, View, Alert } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { useEmailChange, useSignOut } from '@/hooks'
import {
  emailOtpSchema,
  newEmailSchema,
  resolveEmailChangeError,
  verifyPasswordSchema,
  isReauthRequired,
  type EmailOtpFormData,
  type NewEmailFormData,
  type VerifyPasswordFormData,
} from '@/services/profile-service'

import type { EmailChangeFormProps, Step } from './types'

export const EmailChangeForm = ({
  testID = 'email-change-form',
}: EmailChangeFormProps) => {
  const [step, setStep] = useState<Step>('password')
  const [pendingEmail, setPendingEmail] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const signOut = useSignOut()
  const { confirmEmail, requestEmail, resendOtp, verifyPassword } =
    useEmailChange()

  const run = async (action: () => Promise<unknown>, nextStep: Step) => {
    setSubmitError(null)
    try {
      await action()
      setStep(nextStep)
    } catch (error) {
      setSubmitError(resolveEmailChangeError(error))
      if (isReauthRequired(error)) {
        setStep('password')
      }
    }
  }

  const handleConfirm = async (values: EmailOtpFormData) => {
    setSubmitError(null)
    try {
      await confirmEmail(values.otp)
      Alert.alert(
        'Email updated',
        'Please sign in again with your new email address.',
        [{ onPress: () => void signOut(), text: 'OK' }],
        { onDismiss: () => void signOut() }
      )
    } catch (error) {
      setSubmitError(resolveEmailChangeError(error))
      if (isReauthRequired(error)) {
        setStep('password')
      }
    }
  }

  const error = submitError ? (
    <Text
      accessibilityRole="alert"
      variant="caption"
      className="text-danger-red"
    >
      {submitError}
    </Text>
  ) : null

  if (step === 'password') {
    return (
      <Form<VerifyPasswordFormData>
        initialValues={{ password: '' }}
        onSubmitForm={(values) =>
          run(() => verifyPassword(values.password), 'email')
        }
        validationSchema={verifyPasswordSchema}
      >
        <View className="gap-4" testID={testID}>
          <Text variant="sub-sm">
            Confirm your password before changing your email address.
          </Text>
          <TextField
            autoCapitalize="none"
            label="Current password"
            LeftIcon={Lock}
            name="password"
            secure
          />
          {error}
          <Button label="Continue" testID="email-step-password" type="submit" />
        </View>
      </Form>
    )
  }

  if (step === 'email') {
    return (
      <Form<NewEmailFormData>
        initialValues={{ newEmail: '' }}
        onSubmitForm={(values) =>
          run(async () => {
            await requestEmail(values.newEmail)
            setPendingEmail(values.newEmail)
          }, 'otp')
        }
        validationSchema={newEmailSchema}
      >
        <View className="gap-4" testID={testID}>
          <Text variant="sub-sm">
            We will send a 6 digit code to your new address.
          </Text>
          <TextField
            autoCapitalize="none"
            keyboardType="email-address"
            label="New email address"
            LeftIcon={Mail}
            name="newEmail"
          />
          {error}
          <Button label="Send code" testID="email-step-request" type="submit" />
        </View>
      </Form>
    )
  }

  return (
    <Form<EmailOtpFormData>
      initialValues={{ otp: '' }}
      onSubmitForm={handleConfirm}
      validationSchema={emailOtpSchema}
    >
      <View className="gap-4" testID={testID}>
        <Text variant="sub-sm">Enter the code we sent to {pendingEmail}.</Text>
        <TextField
          keyboardType="number-pad"
          label="Verification code"
          LeftIcon={KeyRound}
          maxLength={6}
          name="otp"
        />
        {error}
        <Button label="Confirm" testID="email-step-confirm" type="submit" />
        <Pressable
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => void run(() => resendOtp(), 'otp')}
        >
          <Text
            variant="caption"
            className="text-center font-semibold text-primary-green"
          >
            Resend code
          </Text>
        </Pressable>
      </View>
    </Form>
  )
}
