import { ChevronRight, CircleAlert, CircleCheck } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Text } from '@/components/atoms'
import { StatusBadge } from '@/components/molecules'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'
import type { SecurityAlertBannerProps, SecurityAlertBannerTone } from './types'

const TONES: Record<
  SecurityAlertBannerTone,
  { color: string; container: string; Icon: LucideIcon; title: string }
> = {
  danger: {
    color: colors.danger,
    container: 'border-danger-red/30 bg-danger-red/10',
    Icon: CircleAlert,
    title: 'text-danger-red',
  },
  success: {
    color: colors.primaryGreen,
    container: 'border-primary-green/30 bg-primary-green/10',
    Icon: CircleCheck,
    title: 'text-deep-green',
  },
}

export const SecurityAlertBanner = ({
  badge,
  footer,
  message,
  onPress,
  testID,
  title,
  tone = 'danger',
}: SecurityAlertBannerProps) => {
  const Container = onPress ? Pressable : View
  const { color, container, Icon, title: titleClassName } = TONES[tone]
  return (
    <Container
      accessibilityLabel={onPress ? title : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border p-4 active:opacity-85',
        container
      )}
      onPress={onPress}
      testID={testID}
    >
      <Icon color={color} size={24} />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2">
          <Text className={cn('flex-1 text-sm font-bold', titleClassName)}>
            {title}
          </Text>
          {badge ? <StatusBadge label={badge.label} tone={badge.tone} /> : null}
        </View>
        <Text variant="sub-sm" className="text-text-primary">
          {message}
        </Text>
        {footer?.map((line) => (
          <Text key={line} variant="caption" className="text-text-primary">
            {line}
          </Text>
        ))}
      </View>
      {onPress ? <ChevronRight color={color} size={18} /> : null}
    </Container>
  )
}
