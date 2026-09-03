import { useRouter } from 'expo-router'

import { LoginForm } from '@/components/organisms'
import { AuthScreen } from '@/components/templates'

export const LoginPage = () => {
  const router = useRouter()

  return (
    <AuthScreen subtitle="Log in to your account" title="Welcome back">
      <LoginForm onRegister={() => router.push('/register')} />
    </AuthScreen>
  )
}
