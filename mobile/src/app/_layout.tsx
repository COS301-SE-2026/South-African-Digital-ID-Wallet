import '../../global.css'

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { PrivacyScreenOverlay, SessionLockWatcher } from '@/components/utility'
import { colors } from '@/theme/colors'
import { useAuthStore } from '@/stores/auth-store'

const queryClient = new QueryClient()

export default function RootLayout() {
  const isRestoring = useAuthStore((state) => state.isRestoring)
  const restore = useAuthStore((state) => state.restore)

  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {isRestoring ? (
          <View className="flex-1 items-center justify-center bg-cream-background">
            <ActivityIndicator color={colors.primaryGreen} size="large" />
          </View>
        ) : (
          <>
            <Stack screenOptions={{ headerShown: false }} />
            <SessionLockWatcher />
            <PrivacyScreenOverlay />
          </>
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
