import { Text } from '@/components/atoms'
import { AuthSidebar } from '@/components/organisms'
import { RegistrationForm } from '@/components/molecules'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export const CitizenRegistrationPage = () => {
  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex h-full flex-1 items-center justify-center px-6 py-8 sm:px-8 lg:px-10 xl:px-14">
          <Card className="flex h-full w-full max-w-xl flex-col">
            <CardHeader className="shrink-0 space-y-2 pt-10 text-center">
              <Text variant="h1" className="text-center text-4xl md:text-5xl">
                Create your account
              </Text>
              <Text
                variant="sub-lg"
                className="text-center text-xl md:text-2xl"
              >
                Register for your FlashID account
              </Text>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-y-auto pb-8">
              <RegistrationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
