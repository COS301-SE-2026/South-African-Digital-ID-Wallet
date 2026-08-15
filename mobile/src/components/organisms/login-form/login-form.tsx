import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Lock, Mail } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Button, Divider, Form, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { loginSchema, type LoginFormData } from '@/services/login-service'
import loginService from '@/services/login-service/login-service'
import { resolveLoginError } from '@/services/login-service'
import { useAuthStore } from '@/stores/auth-store'

import type { LoginFormProps } from './types'

const INITIAL_VALUES: LoginFormData = { email: '', password: '' }

export const LoginForm = ({ onForgotPassword, onRegister }: LoginFormProps) => {
  const router = useRouter()
  const signIn = useAuthStore((state) => state.signIn)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleLogin = async (values: LoginFormData) => {
    setSubmitError(null)

    try {
      const session = await loginService.login(values)
      signIn(session)
      router.replace('/home')
    } catch (error) {
      setSubmitError(resolveLoginError(error))
    }
  }

  return (
    <Form
      initialValues={INITIAL_VALUES}
      onSubmitForm={handleLogin}
      validationSchema={loginSchema}
    >
      <View className="gap-4">
        <TextField
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          LeftIcon={Mail}
          name="email"
          placeholder=""
        />
        <TextField
          accessibilityLabel="Password"
          autoCapitalize="none"
          autoComplete="password"
          LeftIcon={Lock}
          name="password"
          placeholder=""
          secure
        />
        <Pressable
          accessibilityRole="button"
          className="self-end"
          hitSlop={6}
          onPress={onForgotPassword}
        >
          <Text variant="caption" className="font-semibold text-primary-green">
            Forgot password?
          </Text>
        </Pressable>
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
