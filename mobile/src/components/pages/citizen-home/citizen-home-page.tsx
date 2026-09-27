import { useCallback, useState } from 'react'
import { useRouter } from 'expo-router'
import { RefreshControl } from 'react-native'

import {
  CitizenDashboardHeader,
  IdentityStatusPanel,
  QuickActionsGrid,
  RecentActivityList,
} from '@/components/organisms'
import { CitizenDashboardScreen } from '@/components/templates'
import { citizenQuickActions } from '@/config'
import {
  usePrefetchOfflinePackages,
  useRecentActivity,
  useWalletCredentials,
} from '@/hooks'
import { useAuthStore } from '@/stores/auth-store'
import { colors } from '@/theme/colors'

const firstName = (names: string | undefined) =>
  (names ?? '').trim().split(' ')[0] || 'there'

export const CitizenHomePage = () => {
  const router = useRouter()
  const names = useAuthStore((state) => state.user?.names)
  const credentials = useWalletCredentials()
  const activity = useRecentActivity()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Home is the first screen after login, so every offline package is prepared from here.
  usePrefetchOfflinePackages(
    credentials.credentials.map((credential) => credential.id)
  )

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([credentials.refetch(), activity.refetch()])
    setIsRefreshing(false)
  }, [activity, credentials])

  return (
    <CitizenDashboardScreen
      header={
        <CitizenDashboardHeader
          name={firstName(names)}
          onNotificationsPress={() => router.push('/citizen/activity')}
          subtitle="Your digital identity, in your pocket."
        />
      }
      refreshControl={
        <RefreshControl
          onRefresh={() => void handleRefresh()}
          refreshing={isRefreshing}
          tintColor={colors.primaryGreen}
        />
      }
    >
      <IdentityStatusPanel onPress={() => router.push('/citizen/wallet')} />
      <QuickActionsGrid
        actions={citizenQuickActions}
        onSelect={(action) => router.push(action.href)}
      />
      <RecentActivityList onViewAll={() => router.push('/citizen/activity')} />
    </CitizenDashboardScreen>
  )
}
