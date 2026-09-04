import { useRouter } from 'expo-router'

import {
  CitizenDashboardHeader,
  IdentityStatusPanel,
  QuickActionsGrid,
  RecentActivityList,
} from '@/components/organisms'
import { CitizenDashboardScreen } from '@/components/templates'
import { citizenQuickActions } from '@/config'
import { useAuthStore } from '@/stores/auth-store'

const firstName = (names: string | undefined) =>
  (names ?? '').trim().split(' ')[0] || 'there'

export const CitizenHomePage = () => {
  const router = useRouter()
  const names = useAuthStore((state) => state.user?.names)

  return (
    <CitizenDashboardScreen
      header={
        <CitizenDashboardHeader
          name={firstName(names)}
          onNotificationsPress={() => router.push('/citizen/activity')}
          subtitle="Your digital identity, in your pocket."
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
