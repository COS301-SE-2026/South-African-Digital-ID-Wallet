import { AppShell } from '@/components/templates'
import { UserProvider } from '@/context/user-context'
import { SessionTimeoutWatcher } from '@/components/utility/session-timeout-watcher'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <SessionTimeoutWatcher />
      <AppShell>{children}</AppShell>
    </UserProvider>
  )
}
