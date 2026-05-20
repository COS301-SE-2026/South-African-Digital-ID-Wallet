import { AppShell } from '@/components/templates/app-shell'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
