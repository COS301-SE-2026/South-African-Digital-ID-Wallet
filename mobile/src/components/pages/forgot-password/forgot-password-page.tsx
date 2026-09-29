import { useRouter } from 'expo-router'

import { ForgotPasswordForm } from '@/components/organisms'
import { AuthScreen } from '@/components/templates'

export const ForgotPasswordPage = () => {
  const router = useRouter()
  const backToLogin = () =>
    router.canGoBack() ? router.back() : router.replace('/login')

  return (
    <AuthScreen
      subtitle="We will email you a 6-digit code to set a new password"
      title="Reset your password"
    >
      <ForgotPasswordForm
        onBackToLogin={backToLogin}
        onComplete={backToLogin}
      />
    </AuthScreen>
  )
}
