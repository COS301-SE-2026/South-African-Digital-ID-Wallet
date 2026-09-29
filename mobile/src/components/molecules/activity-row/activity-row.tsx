import { ChevronRight } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { IconTile, Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type { ActivityRowProps } from './types'

export const ActivityRow = ({
  className,
  description,
  Icon,
  iconShape = 'circle',
  onPress,
  showChevron = false,
  testID,
  timestamp,
  title,
  tone = 'soft-green',
}: ActivityRowProps) => {
  const Container = onPress ? Pressable : View

  return (
    <Container
      accessibilityLabel={onPress ? title : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      className={cn('flex-row items-center gap-3 py-3', className)}
      onPress={onPress}
      testID={testID}
    >
      <IconTile Icon={Icon} shape={iconShape} size="sm" tone={tone} />
      <View className="flex-1 gap-0.5">
        <Text variant="sub-sm" className="font-semibold text-text-primary">
          {title}
        </Text>
        {description ? (
          <Text variant="caption" numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-1">
        <Text variant="caption">{timestamp}</Text>
        {showChevron ? (
          <ChevronRight size={16} color={colors.neutralMidGrey} />
        ) : null}
      </View>
    </Container>
  )
}
