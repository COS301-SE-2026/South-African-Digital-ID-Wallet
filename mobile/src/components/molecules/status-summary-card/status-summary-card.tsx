import { ChevronRight } from 'lucide-react-native'
import { View } from 'react-native'

import { Card, IconTile, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { StatusSummaryCardProps } from './types'

export const StatusSummaryCard = ({
  className,
  description,
  Icon,
  label,
  onPress,
  testID,
  tone = 'soft-green',
  value,
}: StatusSummaryCardProps) => (
  <Card
    accessibilityLabel={`${label}: ${value}`}
    className={className}
    onPress={onPress}
    testID={testID}
  >
    <View className="flex-row items-center gap-4">
      <IconTile Icon={Icon} shape="circle" size="lg" tone={tone} />
      <View className="flex-1 gap-0.5">
        <Text variant="caption">{label}</Text>
        <Text variant="h3">{value}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      {onPress ? (
        <ChevronRight size={20} color={colors.neutralMidGrey} />
      ) : null}
    </View>
  </Card>
)
