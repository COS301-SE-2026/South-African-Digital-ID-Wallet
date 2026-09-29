import { useRouter } from 'expo-router'
import { CircleCheck, ShieldCheck } from 'lucide-react-native'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Card, IconTile, Text } from '@/components/atoms'
import { useSecureAccountResult } from '@/hooks'
import { colors } from '@/theme/colors'

import type { SecurityConfirmationPageProps } from './types'

const FALLBACK_TITLE = 'Your account is secured'

export const SecurityConfirmationPage = ({
  alertId,
}: SecurityConfirmationPageProps) => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const result = useSecureAccountResult(alertId)
  const needsNewPassword = result?.requiresPasswordChange ?? false

  return (
    <View
      className="flex-1 bg-clean-white px-5"
      style={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top + 48 }}
      testID="security-confirmation"
    >
      <ScrollView
        contentContainerClassName="items-center gap-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <IconTile
          className="h-20 w-20"
          Icon={ShieldCheck}
          shape="circle"
          size="lg"
          tone="green"
        />
        <Text variant="h2" className="text-center text-text-primary">
          {result?.title ?? FALLBACK_TITLE}
        </Text>
        {result ? <Text className="text-center">{result.message}</Text> : null}
        {result && result.nextSteps.length > 0 ? (
          <Card className="mt-4 w-full gap-3 bg-cream-background">
            <Text className="font-bold text-text-primary">
              What happens next?
            </Text>
            {result.nextSteps.map((step) => (
              <View className="flex-row gap-3" key={step}>
                <CircleCheck color={colors.success} size={20} />
                <Text variant="sub-sm" className="flex-1 text-text-primary">
                  {step}
                </Text>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
      <View className="gap-3">
        {needsNewPassword ? (
          <Button
            label="Create a new password"
            onPress={() =>
              router.replace({
                params: { alertId },
                pathname: '/citizen/security/[alertId]/new-password',
              })
            }
            testID="create-new-password-button"
          />
        ) : null}
        <Button
          label="Back to dashboard"
          onPress={() => router.replace('/citizen/home')}
          testID="back-to-dashboard-button"
          variant={needsNewPassword ? 'secondary' : 'primary'}
        />
        <Button
          label="Review security activity"
          onPress={() => router.dismissTo('/citizen/security')}
          testID="review-security-activity-button"
          variant="text"
        />
      </View>
    </View>
  )
}
