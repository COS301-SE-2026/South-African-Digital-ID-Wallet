import { ShieldCheck } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Button, Form, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import {
  deviceVerificationSchema,
  type DeviceVerificationFormData,
} from '@/services/login-service'

import type { DeviceVerificationFormProps } from './types'

const INITIAL_VALUES: DeviceVerificationFormData = { otp: '' }

export const DeviceVerificationForm = ({
  email,
  onCancel,
  onVerify,
  submitError,
  testID = 'device-verification-form',
}: DeviceVerificationFormProps) => (
  <Form
    initialValues={INITIAL_VALUES}
    onSubmitForm={({ otp }) => onVerify(otp)}
    validationSchema={deviceVerificationSchema}
  >
    <View className="gap-4" testID={testID}>
      <Text variant="sub-md" className="text-center">
        We emailed a 6-digit code to {email}. It expires in 10 minutes.
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
        label="Verify device"
        testID="device-verify-submit"
        type="submit"
      />
      <Pressable
        accessibilityRole="button"
        className="self-center"
        hitSlop={6}
        onPress={onCancel}
      >
        <Text variant="caption" className="font-semibold text-primary-green">
          Use a different account
        </Text>
      </Pressable>
    </View>
  </Form>
)
