import { Text } from '@/components/atoms'
import { AuthSidebar, LoginForm } from '@/components/organisms'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export const LoginPage = () => {
  return (
    <main className="min-h-screen bg-cream-background text-deep-green">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
          <Card className="w-full max-w-xl min-h-136 lg:min-h-152">
            <CardHeader className="space-y-3 pt-8 text-center">
              <Text variant="h1" className="text-center text-4xl md:text-5xl">
                Welcome back
              </Text>
              <Text
                variant="sub-lg"
                className="text-center text-xl md:text-2xl"
              >
                Log into your FlashID account.
              </Text>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-center pb-8">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
