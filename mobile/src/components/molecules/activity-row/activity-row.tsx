import { Pressable, View } from 'react-native'

import { IconTile, Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { ActivityRowProps } from './types'
import { timeStamp } from 'console'

export const ActivityRow = ({
  className,
  description,
  Icon,
  onPress,
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
      </View>
      <Text variant="caption">{timestamp}</Text>
    </Container>
  )
}
