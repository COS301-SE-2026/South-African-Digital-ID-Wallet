import { ChevronRight, CircleAlert } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'
import type { SecurityAlertBannerProps } from './types'

export const SecurityAlertBanner = ({
  footer,
  message,
  onPress,
  testID,
  title,
}: SecurityAlertBannerProps) => {
  const Container = onPress ? Pressable : View
  return (
    <Container
      accessibilityLabel={onPress ? title : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      className="flex-row items-center gap-3 rounded-2xl border border-danger-red/30 bg-danger-red/10 p-4 active:opacity-85"
      onPress={onPress}
      testID={testID}
    >
      <CircleAlert color={colors.danger} size={24} />
      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold text-danger-red">{title}</Text>
        <Text variant="sub-sm" className="text-text-primary">
          {message}
        </Text>
        {footer?.map((line) => (
          <Text key={line} variant="caption" className="text-text-primary">
            {line}
          </Text>
        ))}
      </View>
      {onPress ? <ChevronRight color={colors.danger} size={18} /> : null}
    </Container>
  )
}
