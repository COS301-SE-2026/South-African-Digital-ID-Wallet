import { Text } from '@/components/atoms'
import { AuthSidebar } from '@/components/organisms'
import { VerifyEmailForm } from '@/components/organisms/verify-email-form/verify-email-form'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Suspense } from 'react'

export const VerifyEmailPage = () => {
  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex h-full flex-1 items-center justify-center px-6 py-8 sm:px-8 lg:px-10 xl:px-14">
          <Card className="flex h-full w-full max-w-xl flex-col">
            <CardHeader className="shrink-0 space-y-2 pt-10 text-center">
              <Text variant="h1" className="text-center text-4xl md:text-5xl">
                Verify your email
              </Text>
              <Text
                variant="sub-lg"
                className="text-center text-xl md:text-2xl"
              >
                Enter the 6-digit code we sent to your email address
              </Text>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-y-auto pb-8">
              <Suspense>
                <VerifyEmailForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
