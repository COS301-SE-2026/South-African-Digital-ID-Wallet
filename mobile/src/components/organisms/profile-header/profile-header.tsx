import { ShieldCheck } from 'lucide-react-native'
import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { ProfileHeaderProps } from './types'

export const ProfileHeader = ({
  email,
  initials,
  name,
  roleLabel,
  testID = 'profile-header',
}: ProfileHeaderProps) => (
  <View className="flex-row items-center gap-4" testID={testID}>
    <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-green/10">
      <Text className="text-2xl font-bold text-primary-green">{initials}</Text>
    </View>
    <View className="flex-1 gap-1">
      <Text variant="h3" numberOfLines={1}>
        {name}
      </Text>
      <Text variant="sub-sm" numberOfLines={1}>
        {email}
      </Text>
      <View className="mt-1 flex-row">
        <View className="flex-row items-center gap-1.5 rounded-full bg-success-green/10 px-3 py-1">
          <ShieldCheck size={13} color={colors.success} />
          <Text variant="caption" className="font-semibold text-success-green">
            {roleLabel}
          </Text>
        </View>
      </View>
    </View>
  </View>
)
