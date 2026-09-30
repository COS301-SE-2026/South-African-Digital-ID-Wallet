import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react-native'
import { Alert, Pressable, View } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { RequirementList, TextField } from '@/components/molecules'
import {
  forgotPasswordSchema,
  loginService,
  resetPasswordSchema,
  resolvePasswordResetError,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from '@/services/login-service'
import { checkPassword } from '@/services/register-service'

import type { ForgotPasswordFormProps } from './types'

const RESEND_COOLDOWN_SECONDS = 60

const REQUEST_INITIAL_VALUES: ForgotPasswordFormData = { email: '' }

const RESET_INITIAL_VALUES: ResetPasswordFormData = {
  confirmPassword: '',
  newPassword: '',
  otp: '',
}

const NewPasswordChecklist = () => {
  const { values } = useFormikContext<ResetPasswordFormData>()

  if (!values.newPassword) {
    return null
  }
  return (
    <RequirementList
      items={checkPassword(values.newPassword)}
      testID="new-password-requirements"
    />
  )
}

const ErrorText = ({ message }: { message: string | null }) =>
  message ? (
    <Text
      accessibilityRole="alert"
      variant="caption"
      className="text-center text-danger-red"
    >
      {message}
    </Text>
  ) : null

export const ForgotPasswordForm = ({
  onBackToLogin,
  onComplete,
}: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const requestCode = async (address: string) => {
    setSubmitError(null)
    try {
      await loginService.forgotPassword(address)
      setEmail(address)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (error) {
      setSubmitError(resolvePasswordResetError(error))
    }
  }

  const handleResend = async () => {
    if (!email) {
      return
    }
    setIsResending(true)
    await requestCode(email)
    setIsResending(false)
  }

  const handleReset = async (values: ResetPasswordFormData) => {
    if (!email) {
      return
    }
    setSubmitError(null)
    try {
      await loginService.resetPassword({ email, ...values })
      Alert.alert('Password updated', 'Log in with your new password.', [
        { onPress: onComplete, text: 'Log in' },
      ])
    } catch (error) {
      setSubmitError(resolvePasswordResetError(error))
    }
  }

  const backToLoginLink = (
    <Pressable accessibilityRole="link" hitSlop={6} onPress={onBackToLogin}>
      <Text variant="sub-sm" className="text-primary-green">
        Back to login
      </Text>
    </Pressable>
  )

  if (!email) {
    return (
      <Form
        initialValues={REQUEST_INITIAL_VALUES}
        onSubmitForm={(values) => requestCode(values.email.trim())}
        validationSchema={forgotPasswordSchema}
      >
        <View className="gap-4" testID="forgot-password-request">
          <TextField
            label="Email:"
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            LeftIcon={Mail}
            name="email"
            placeholder="you@example.com"
          />
          <ErrorText message={submitError} />
          <Button
            label="Send reset code"
            LeftIcon={Mail}
            testID="forgot-password-submit"
            type="submit"
          />
          <View className="items-center pt-2">{backToLoginLink}</View>
        </View>
      </Form>
    )
  }

  return (
    <Form
      initialValues={RESET_INITIAL_VALUES}
      onSubmitForm={handleReset}
      validationSchema={resetPasswordSchema}
    >
      <View className="gap-4" testID="forgot-password-reset">
        <Text variant="sub-md" className="text-center">
          If {email} has an account, a 6-digit reset code is on its way.
        </Text>
        <TextField
          label="Reset code:"
          accessibilityLabel="Reset code"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          LeftIcon={ShieldCheck}
          maxLength={6}
          name="otp"
          placeholder="123456"
          textContentType="oneTimeCode"
        />
        <View className="gap-1.5">
          <TextField
            label="New password:"
            accessibilityLabel="New password"
            autoCapitalize="none"
            autoComplete="new-password"
            LeftIcon={Lock}
            name="newPassword"
            placeholder=""
            secure
          />
          <NewPasswordChecklist />
        </View>
        <TextField
          label="Confirm new password:"
          accessibilityLabel="Confirm new password"
          autoCapitalize="none"
          autoComplete="new-password"
          LeftIcon={Lock}
          name="confirmPassword"
          placeholder=""
          secure
        />
        <ErrorText message={submitError} />
        <Button
          label="Update password"
          LeftIcon={KeyRound}
          testID="reset-password-submit"
          type="submit"
        />
        <View className="flex-row items-center justify-between pt-2">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isResending || cooldown > 0 }}
            disabled={isResending || cooldown > 0}
            hitSlop={6}
            onPress={() => void handleResend()}
            testID="resend-reset-code"
          >
            <Text
              variant="sub-sm"
              className={
                cooldown > 0 || isResending
                  ? 'font-semibold text-muted-text'
                  : 'font-semibold text-primary-green'
              }
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </Text>
          </Pressable>
          {backToLoginLink}
        </View>
        <View className="flex-row items-center justify-center">
          <Text variant="sub-sm">Wrong email? </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => {
              setEmail(null)
              setSubmitError(null)
            }}
          >
            <Text variant="sub-sm" className="font-bold text-primary-green">
              Use a different email
            </Text>
          </Pressable>
        </View>
      </View>
    </Form>
  )
}
