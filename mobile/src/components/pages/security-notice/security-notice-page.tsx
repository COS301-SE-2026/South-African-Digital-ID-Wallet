import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Info, ShieldAlert } from 'lucide-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button, Card, Divider, IconTile, Text } from '@/components/atoms'
import { SecurityDetailRow } from '@/components/molecules'
import { toNoticeDetails } from '@/services/security-service'
import { useSecurityNoticeStore } from '@/stores/security-notice-store'
import { colors } from '@/theme/colors'

export const SecurityNoticePage = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [notice] = useState(() => useSecurityNoticeStore.getState().notice)

  useEffect(() => () => useSecurityNoticeStore.getState().clear(), [])

  const goHome = () => router.replace('/citizen/home')

  if (!notice) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4 bg-clean-white px-5"
        testID="security-notice-empty"
      >
        <Text variant="sub-sm" className="text-center">
          There is no new security alert to review.
        </Text>
        <Button label="Go to dashboard" onPress={goHome} />
      </View>
    )
  }

  const params = { alertId: notice.alertId }

  return (
    <View
      className="flex-1 bg-clean-white px-5"
      style={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top + 8 }}
      testID="security-notice"
    >
      <View className="flex-row justify-end">
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={goHome}
          testID="security-notice-skip"
        >
          <Text variant="sub-sm" className="font-semibold">
            Skip for now
          </Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerClassName="gap-5 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-3 rounded-3xl border border-danger-red/30 bg-danger-red/10 px-5 py-6">
          <IconTile
            className="h-16 w-16"
            Icon={ShieldAlert}
            shape="circle"
            size="lg"
            tone="red"
          />
          <Text variant="h3" className="text-center text-danger-red">
            Suspicious login detected
          </Text>
          <Text variant="sub-sm" className="text-center text-text-primary">
            {notice.message}
          </Text>
        </View>
        <Card className="py-1">
          {toNoticeDetails(notice).map((detail, index) => (
            <View key={detail.label}>
              {index > 0 ? <Divider /> : null}
              <SecurityDetailRow
                {...detail}
                testID={`security-notice-detail-${index}`}
              />
            </View>
          ))}
        </Card>
        {notice.qrGenerationRestricted ? (
          <View className="flex-row gap-3 rounded-2xl border border-warning-amber/30 bg-warning-amber/10 p-4">
            <Info color={colors.warning} size={20} />
            <Text variant="sub-sm" className="flex-1 text-text-primary">
              QR code sharing is paused until you review this alert.
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <View className="gap-3">
        <Button
          label="View details"
          onPress={() =>
            router.replace({ params, pathname: '/citizen/security/[alertId]' })
          }
          testID="security-notice-details"
        />
        <Button
          label="Secure my account"
          onPress={() =>
            router.replace({
              params,
              pathname: '/citizen/security/[alertId]/secure',
            })
          }
          testID="security-notice-secure"
          variant="secondary"
        />
        <Button
          label="This was me"
          onPress={() =>
            router.replace({
              params,
              pathname: '/citizen/security/[alertId]/dismiss',
            })
          }
          testID="security-notice-was-me"
          variant="text"
        />
      </View>
    </View>
  )
}
