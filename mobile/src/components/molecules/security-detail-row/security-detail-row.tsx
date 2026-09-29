import { View } from 'react-native'
import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import { StatusBadge } from '../status-badge'
import type { SecurityDetailRowProps } from './types'

export const SecurityDetailRow = ({
  badge,
  hint,
  Icon,
  label,
  testID,
  value,
}: SecurityDetailRowProps) => (
  <View className="flex-row gap-3 py-3" testID={testID}>
    <Icon color={colors.textPrimary} size={20} />
    <View className="flex-1 gap-0.5">
      <Text variant="sub-sm" className="font-semibold text-text-primary">
        {label}
      </Text>
      <Text variant="sub-sm">{value}</Text>
      {hint ? <Text variant="caption">{hint}</Text> : null}
    </View>
    {badge ? <StatusBadge label={badge.label} tone={badge.tone} /> : null}
  </View>
)
