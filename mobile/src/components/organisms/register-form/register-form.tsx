import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useFormikContext } from 'formik'
import { Lock, Mail } from 'lucide-react-native'
import { Alert, Pressable, View } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { RequirementList, TextField } from '@/components/molecules'
import { VerifyEmailForm } from '@/components/organisms'
import {
  checkPassword,
  registerSchema,
  registerService,
  resolveRegisterError,
  type RegisterFormData,
} from '@/services/register-service'

import type { RegisterFormProps } from './types'

const INITIAL_VALUES: RegisterFormData = {
  confirmPassword: '',
  email: '',
  password: '',
}

const PasswordChecklist = () => {
  const { values } = useFormikContext<RegisterFormData>()

  if (!values.password) {
    return null
  }
  return (
    <RequirementList
      items={checkPassword(values.password)}
      testID="password-requirements"
    />
  )
}

export const RegisterForm = ({ onSignIn }: RegisterFormProps) => {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const handleRegister = async (values: RegisterFormData) => {
    setSubmitError(null)
    try {
      await registerService.register(values)
      setPendingEmail(values.email.trim())
    } catch (error) {
      setSubmitError(resolveRegisterError(error))
    }
  }

  const handleVerify = async (otp: string) => {
    if (!pendingEmail) {
      return
    }
    setSubmitError(null)
    try {
      await registerService.verifyEmail({ email: pendingEmail, otp })
      Alert.alert('Account verified', 'Log in to start using FlashID.', [
        { onPress: () => router.replace('/login'), text: 'Log in' },
      ])
    } catch (error) {
      setSubmitError(resolveRegisterError(error))
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) {
      return
    }
    setSubmitError(null)
    try {
      await registerService.resendOtp(pendingEmail)
    } catch (error) {
      setSubmitError(resolveRegisterError(error))
    }
  }

  if (pendingEmail) {
    return (
      <VerifyEmailForm
        email={pendingEmail}
        onCancel={() => {
          setPendingEmail(null)
          setSubmitError(null)
        }}
        onResend={handleResend}
        onVerify={handleVerify}
        submitError={submitError}
      />
    )
  }

  return (
    <Form
      initialValues={INITIAL_VALUES}
      onSubmitForm={handleRegister}
      validationSchema={registerSchema}
    >
      <View className="gap-4">
        <TextField
          label="Email:"
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          LeftIcon={Mail}
          name="email"
          placeholder=""
        />
        <View className="gap-1.5">
          <TextField
            label="Password:"
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoComplete="new-password"
            LeftIcon={Lock}
            name="password"
            placeholder=""
            secure
          />
          <PasswordChecklist />
        </View>
        <TextField
          label="Verify password:"
          accessibilityLabel="Verify password"
          autoCapitalize="none"
          autoComplete="new-password"
          LeftIcon={Lock}
          name="confirmPassword"
          placeholder=""
          secure
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
        <Button label="Create account" testID="register-submit" type="submit" />
        <View className="flex-row items-center justify-center pt-2">
          <Text variant="sub-sm"> Already have an account? </Text>
          <Pressable accessibilityRole="button" hitSlop={6} onPress={onSignIn}>
            <Text variant="sub-sm" className="font-bold text-primary-green">
              Log in
            </Text>
          </Pressable>
        </View>
      </View>
    </Form>
  )
}
