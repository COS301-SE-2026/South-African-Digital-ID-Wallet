import { ChevronRight } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { IconTile, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import { StatusBadge } from '../status-badge'
import type { SecurityActivityRowProps } from './types'

export const SecurityActivityRow = ({
  badge,
  description,
  Icon,
  onPress,
  testID,
  timestamp,
  title,
  tone,
}: SecurityActivityRowProps) => {
  const Container = onPress ? Pressable : View
  return (
    <Container
      accessibilityLabel={onPress ? title : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      className="flex-row items-center gap-3 py-3 active:opacity-85"
      onPress={onPress}
      testID={testID}
    >
      <IconTile Icon={Icon} shape="circle" size="sm" tone={tone} />
      <View className="flex-1 gap-0.5">
        <Text variant="sub-sm" className="font-semibold text-text-primary">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" numberOfLines={1}>
            {description}
          </Text>
        ) : null}
        <Text variant="caption">{timestamp}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        {badge ? <StatusBadge label={badge.label} tone={badge.tone} /> : null}
        {onPress ? (
          <ChevronRight color={colors.neutralMidGrey} size={16} />
        ) : null}
      </View>
    </Container>
  )
}
