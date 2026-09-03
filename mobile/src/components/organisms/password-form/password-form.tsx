import { useState } from 'react'
import { Lock } from 'lucide-react-native'
import { View, Alert } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { useUpdatePassword, useSignOut } from '@/hooks'
import {
  resolvePasswordError,
  updatePasswordSchema,
  type UpdatePasswordFormData,
} from '@/services'

import type { PasswordFormProps } from './types'

const INITIAL_VALUES: UpdatePasswordFormData = {
  confirmPassword: '',
  currentPassword: '',
  newPassword: '',
}

export const PasswordForm = ({
  testID = 'password-form',
}: PasswordFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { updatePassword } = useUpdatePassword()
  const signOut = useSignOut()

  const handleSubmit = async (values: UpdatePasswordFormData) => {
    setSubmitError(null)
    try {
      await updatePassword(values)
      Alert.alert(
        'Password updated',
        'Please sign in again with your new password.',
        [{ onPress: () => void signOut(), text: 'OK' }],
        { onDismiss: () => void signOut() }
      )
    } catch (error) {
      setSubmitError(resolvePasswordError(error))
    }
  }

  return (
    <Form
      initialValues={INITIAL_VALUES}
      onSubmitForm={handleSubmit}
      validationSchema={updatePasswordSchema}
    >
      <View className="gap-4" testID={testID}>
        <TextField
          autoCapitalize="none"
          label="Current password"
          LeftIcon={Lock}
          name="currentPassword"
          secure
        />
        <TextField
          autoCapitalize="none"
          label="New password"
          LeftIcon={Lock}
          name="newPassword"
          secure
        />
        <TextField
          autoCapitalize="none"
          label="Confirm new password"
          LeftIcon={Lock}
          name="confirmPassword"
          secure
        />
        {submitError ? (
          <Text
            accessibilityRole="alert"
            variant="caption"
            className="text-danger-red"
          >
            {submitError}
          </Text>
        ) : null}
        <Button
          label="Update password"
          testID="password-submit"
          type="submit"
        />
      </View>
    </Form>
  )
}
