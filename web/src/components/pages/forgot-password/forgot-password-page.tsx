import { Text } from '@/components/atoms'
import { AuthSidebar } from '@/components/organisms'
import { ForgotPasswordForm } from '@/components/organisms/forgot-password-form/forgot-password-form'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export const ForgotPasswordPage = () => {
  return (
    // min-h-dvh instead of h-screen overflow-hidden so the form scrolls on phones
    <main className="min-h-dvh bg-background text-foreground">
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-14">
          <Card className="w-full max-w-xl">
            <CardHeader className="space-y-2 pt-10 text-center">
              <Text variant="h1" className="text-center text-4xl md:text-5xl">
                Reset your password
              </Text>
              <Text
                variant="sub-lg"
                className="text-center text-xl md:text-2xl"
              >
                We will email you a 6-digit code to set a new password
              </Text>
            </CardHeader>
            <CardContent className="pb-8">
              <ForgotPasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
