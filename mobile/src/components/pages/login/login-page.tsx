import { LoginForm } from '@/components/organisms'
import { AuthScreen } from '@/components/templates'

export const LoginPage = () => (
  <AuthScreen subtitle="Log in to your account" title="Welcome back">
    <LoginForm />
  </AuthScreen>
)
