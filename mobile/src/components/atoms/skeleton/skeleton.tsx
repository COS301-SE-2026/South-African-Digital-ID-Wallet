import { View } from 'react-native'

import { cn } from '@/lib/utils'

import type { SkeletonProps } from './types'

export const Skeleton = ({ className, testID }: SkeletonProps) => (
  <View
    accessibilityRole="progressbar"
    className={cn('h-4 rounded-lg bg-border-grey', className)}
    testID={testID}
  />
)
