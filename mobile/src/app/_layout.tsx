import '../../global.css'
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  BiometricLockOverlay,
  OfflineVerificationSync,
  PrivacyScreenOverlay,
  SessionLockWatcher,
} from '@/components/utility'
import { colors } from '@/theme/colors'
import { useAuthStore } from '@/stores/auth-store'

const queryClient = new QueryClient()
// TanStack assumes the phone is always online, so offline refetches fail and replace data with errors.
// Given the real state (same rule as useNetworkStatus), it pauses them and keeps the last data.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(
      state.isConnected !== false && state.isInternetReachable !== false
    )
  })
)

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
            <OfflineVerificationSync />
            <PrivacyScreenOverlay />
            <BiometricLockOverlay />
          </>
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
