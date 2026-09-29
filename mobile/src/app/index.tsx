import { Redirect } from 'expo-router'

import { normalizeRole, ROLE_HOME } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => normalizeRole(state.user?.role))

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }
  if (role === null) {
    return <Redirect href="/unsupported-role" />
  }
  return <Redirect href={ROLE_HOME[role]} />
}
