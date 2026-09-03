import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { useAuthStore } from '@/stores/auth-store'

export default function UnsupportedRole() {
  const router = useRouter()
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-cream-background px-6">
      <Text variant="h2">Not available on mobile</Text>
      <Text variant="sub-md" className="text-center">
        This account type is only supported on the web portal.
      </Text>
      <Button
        label="Back to login"
        onPress={() => {
          signOut()
          router.replace('/login')
        }}
      />
    </View>
  )
}
