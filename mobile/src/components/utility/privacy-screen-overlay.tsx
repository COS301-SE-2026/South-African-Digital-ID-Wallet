import { useEffect, useState } from 'react'
import { AppState, type AppStateStatus, View } from 'react-native'

import { Text } from '@/components/atoms'
import { useAuthStore } from '@/stores/auth-store'

export const PrivacyScreenOverlay = () => {
  const [isObscured, setIsObscured] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  useEffect(() => {
    const handleChange = (nextState: AppStateStatus) => {
      setIsObscured(nextState !== 'active')
    }
    const subscription = AppState.addEventListener('change', handleChange)
    return () => subscription.remove()
  }, [])

  if (!isObscured || !isAuthenticated) {
    return null
  }

  return (
    <View className="absolute inset-0 items-center justify-center bg-deep-green">
      <Text variant="h2" className="text-clean-white">
        FlashID
      </Text>
    </View>
  )
}
