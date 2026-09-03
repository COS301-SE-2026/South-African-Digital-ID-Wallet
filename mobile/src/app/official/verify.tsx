import { usePreventScreenCapture } from 'expo-screen-capture'
import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { BiometricGate } from '@/components/templates'

export default function Verify() {
  usePreventScreenCapture()
  return (
    <BiometricGate prompt="Confirm your identity to verify a credential.">
      <View className="flex-1 items-center justify-center bg-cream-background">
        <Text variant="h2">Verify</Text>
      </View>
    </BiometricGate>
  )
}
