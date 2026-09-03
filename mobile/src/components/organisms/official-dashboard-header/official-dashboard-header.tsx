import { ShieldCheck } from 'lucide-react-native'
import { View } from 'react-native'

import { Skeleton, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { OfficialDashboardHeaderProps } from './types'

export const OfficialDashboardHeader = ({
  greeting,
  institution,
  isPending = false,
  name,
  testID = 'official-dashboard-header',
}: OfficialDashboardHeaderProps) => (
  <View className="gap-1" testID={testID}>
    <Text variant="sub-md" className="text-clean-white/70">
      {`${greeting},`}
    </Text>
    <Text variant="h1" className="text-clean-white">
      {name}
    </Text>
    <View className="mt-2 flex-row items-center gap-2">
      <ShieldCheck size={16} color={colors.gold} />
      {isPending ? (
        <Skeleton className="h-4 w-32 bg-clean-white/20" />
      ) : (
        <Text
          variant="sub-sm"
          className="font-semibold text-clean-white"
          numberOfLines={1}
          testID="official-institution"
        >
          {institution ?? 'Institution unavailable'}
        </Text>
      )}
    </View>
  </View>
)
