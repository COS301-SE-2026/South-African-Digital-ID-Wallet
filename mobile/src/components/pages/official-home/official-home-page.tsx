import { useRouter } from 'expo-router'
import { RefreshControl } from 'react-native'

import {
  OfficialDashboardHeader,
  OfficialStatsRow,
  QuickActionsGrid,
  RecentActivityList,
} from '@/components/organisms'
import { CitizenDashboardScreen } from '@/components/templates'
import { officialQuickActions } from '@/config'
import { useOfficerBadge, useOfficialStats, useVerifierTrust } from '@/hooks'
import { greetingForHour } from '@/lib/format-date'
import { useAuthStore } from '@/stores/auth-store'
import { colors } from '@/theme/colors'

const officerName = (surname: string | undefined) =>
  `Officer ${(surname ?? '').trim() || 'on duty'}`

export const OfficialHomePage = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { badge, isPending, refetch } = useOfficerBadge()
  const stats = useOfficialStats()
  // Downloads the issuer keys at login, so the first offline scan works without opening the scanner online
  useVerifierTrust()

  return (
    <CitizenDashboardScreen
      header={
        <OfficialDashboardHeader
          greeting={greetingForHour()}
          institution={badge?.institutionName}
          isPending={isPending}
          name={officerName(user?.surname)}
        />
      }
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void refetch()
            void stats.refetch()
          }}
          refreshing={stats.isRefetching}
          tintColor={colors.primaryGreen}
        />
      }
      testID="official-dashboard-screen"
    >
      <OfficialStatsRow
        isCapped={stats.stats.isCapped}
        isError={stats.isError}
        isPending={stats.isPending}
        todayCount={stats.stats.todayCount}
      />

      <QuickActionsGrid
        actions={officialQuickActions}
        onSelect={(action) => router.push(action.href)}
      />

      <RecentActivityList onViewAll={() => router.push('/official/history')} />
    </CitizenDashboardScreen>
  )
}
