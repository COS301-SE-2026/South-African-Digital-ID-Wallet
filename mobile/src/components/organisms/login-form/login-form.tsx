import { useState } from 'react'
import { useRouter } from 'expo-router'
import * as LocalAuthentication from 'expo-local-authentication'
import { Lock, Mail } from 'lucide-react-native'
import { Pressable, View, Alert } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { DeviceVerificationForm } from '@/components/organisms'
import { describeDevice } from '@/lib/device-info'
import { normalizeRole, ROLE_HOME } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'
import {
  getBiometricPrompted,
  setBiometricPrompted,
} from '@/lib/secure-session'
import {
  loginSchema,
  loginService,
  resolveLoginError,
  type LoginFormData,
  type LoginResponse,
} from '@/services/login-service'

import type { LoginFormProps } from './types'

const INITIAL_VALUES: LoginFormData = { email: '', password: '' }

export const LoginForm = ({ onRegister }: LoginFormProps) => {
  const router = useRouter()
  const signIn = useAuthStore((state) => state.signIn)
  const isBiometricEnabled = useAuthStore((state) => state.isBiometricEnabled)
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pending, setPending] = useState<{
    deviceVerificationId: string
    email: string
  } | null>(null)

  const offerBiometricUnlock = async () => {
    if (isBiometricEnabled) {
      return
    }
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      getBiometricPrompted(),
    ])
    if (!hasHardware || !isEnrolled) {
      return
    }
    await setBiometricPrompted().catch(() => {})
    Alert.alert(
      'Skip the password next time?',
      'Unlock FlashID with your face or fingerprint when you reopen the app.',
      [
        { style: 'cancel', text: 'Not now' },
        {
          onPress: () => void setBiometricEnabled(true),
          text: 'Enable',
        },
      ]
    )
  }

  const completeSignIn = (session: LoginResponse) => {
    signIn(session)
    const role = normalizeRole(session.role)
    router.replace(role ? ROLE_HOME[role] : '/unsupported-role')
    void offerBiometricUnlock()
  }

  const handleLogin = async (values: LoginFormData) => {
    setSubmitError(null)
    try {
      const session = await loginService.login(values)
      if (session.requiresDeviceVerification && session.deviceVerificationId) {
        setPending({
          deviceVerificationId: session.deviceVerificationId,
          email: values.email,
        })
        return
      }
      completeSignIn(session)
    } catch (error) {
      setSubmitError(resolveLoginError(error))
    }
  }

  const handleVerify = async (otp: string) => {
    if (!pending) {
      return
    }
    setSubmitError(null)
    try {
      const session = await loginService.verifyDevice({
        deviceVerificationId: pending.deviceVerificationId,
        otp,
        ...describeDevice(),
      })
      completeSignIn(session)
    } catch (error) {
      setSubmitError(resolveLoginError(error))
    }
  }

  if (pending) {
    return (
      <DeviceVerificationForm
        email={pending.email}
        onCancel={() => {
          setPending(null)
          setSubmitError(null)
        }}
        onVerify={handleVerify}
        submitError={submitError}
      />
    )
  }

  return (
    <Form
      initialValues={INITIAL_VALUES}
      onSubmitForm={handleLogin}
      validationSchema={loginSchema}
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
        <TextField
          label="Password:"
          accessibilityLabel="Password"
          autoCapitalize="none"
          autoComplete="password"
          LeftIcon={Lock}
          name="password"
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
        <Button label="Log In" testID="login-submit" type="submit" />
        <View className="flex-row items-center justify-center pt-2">
          <Text variant="sub-sm">Don&apos;t have an account? </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={6}
            onPress={onRegister}
          >
            <Text variant="sub-sm" className="font-bold text-primary-green">
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>
    </Form>
  )
}
