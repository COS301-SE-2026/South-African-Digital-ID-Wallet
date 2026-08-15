import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { useAuthStore } from '@/stores/auth-store'

export default function Home() {
  const user = useAuthStore((state) => state.user)

  return (
    <View className="flex-1 items-center justify-center gap-2 bg-cream-background px-6">
      <Text variant="h2">Signed In</Text>
      <Text variant="sub-md">
        {user ? `${user.names} ${user.surname}` : 'No session'}
      </Text>
    </View>
  )
}
