import { Redirect, Tabs } from 'expo-router'

import { BottomNavBar } from '@/components/organisms'
import { citizenTabs } from '@/config/navigation'
import { normalizeRole, ROLE_HOME } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

export default function CitizenLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => normalizeRole(state.user?.role))
  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }
  if (role === null) {
    return <Redirect href="/unsupported-role" />
  }
  if (role !== 'citizen') {
    return <Redirect href={ROLE_HOME[role]} />
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNavBar {...props} tabs={citizenTabs} />}
    >
      {citizenTabs.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  )
}
