import { UserProvider } from '@/context/user-context'

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserProvider>{children}</UserProvider>
}
