import { useRouter } from 'expo-router'
import { KeyRound } from 'lucide-react-native'
import { View } from 'react-native'

import { Button, IconTile, Text } from '@/components/atoms'
import { PasswordForm } from '@/components/organisms'
import { DetailScreen } from '@/components/templates'

import type { SecurityNewPasswordPageProps } from './types'

export const SecurityNewPasswordPage = ({
  alertId,
}: SecurityNewPasswordPageProps) => {
  const router = useRouter()

  const skipToConfirmation = () =>
    router.replace({
      params: { alertId },
      pathname: '/citizen/security/[alertId]/secured',
    })

  return (
    <DetailScreen
      action={
        <Button
          label="Skip for now"
          onPress={skipToConfirmation}
          testID="security-new-password-skip"
          variant="text"
        />
      }
      onBack={skipToConfirmation}
      testID="security-new-password"
      title="Create a new password"
    >
      <View className="items-center gap-3 pt-2">
        <IconTile Icon={KeyRound} shape="circle" size="lg" tone="soft-green" />
        <Text variant="h3" className="text-center text-text-primary">
          Choose a new password
        </Text>
        <Text variant="sub-sm" className="text-center">
          Changing your password signs you out everywhere, including this phone,
          and every device will need to verify again with an email code.
        </Text>
      </View>
      <PasswordForm testID="security-new-password-form" />
    </DetailScreen>
  )
}
