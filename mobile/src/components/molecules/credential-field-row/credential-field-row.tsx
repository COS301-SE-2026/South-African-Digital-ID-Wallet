import { View } from 'react-native'

import { Text } from '@/components/atoms'

import type { CredentialFieldRowProps } from './types'

export const CredentialFieldRow = ({
  label,
  testID,
  value,
}: CredentialFieldRowProps) => (
  <View className="gap-0.5" testID={testID}>
    <Text variant="caption"> {label}</Text>
    <Text className="text-base font-semibold text-text-primary"> {value}</Text>
  </View>
)
