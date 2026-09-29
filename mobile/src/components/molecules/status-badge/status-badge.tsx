import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'

import type { StatusBadgeProps, StatusBadgeTone } from './types'

const CONTAINERS: Record<StatusBadgeTone, string> = {
  danger: 'bg-danger-red/10',
  neutral: 'bg-border-grey',
  success: 'bg-success-green/10',
  warning: 'bg-warning-amber/10',
}

const LABELS: Record<StatusBadgeTone, string> = {
  danger: 'text-danger-red',
  neutral: 'text-muted-text',
  success: 'text-success-green',
  warning: 'text-warning-amber',
}

export const StatusBadge = ({
  label,
  testID,
  tone = 'neutral',
}: StatusBadgeProps) => (
  <View
    className={cn('self-start rounded-full px-2.5 py-0.5', CONTAINERS[tone])}
    testID={testID}
  >
    <Text variant="caption" className={cn('font-semibold', LABELS[tone])}>
      {label}
    </Text>
  </View>
)
