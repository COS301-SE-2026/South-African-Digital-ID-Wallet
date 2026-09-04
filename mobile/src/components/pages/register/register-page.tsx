import { useRouter } from 'expo-router'

import { RegisterForm } from '@/components/organisms'
import { AuthScreen } from '@/components/templates'

export const RegisterPage = () => {
  const router = useRouter()

  return (
    <AuthScreen
      subtitle="Register for your FlashID account"
      title="Create your account"
    >
      <RegisterForm onSignIn={() => router.replace('/login')} />
    </AuthScreen>
  )
}
