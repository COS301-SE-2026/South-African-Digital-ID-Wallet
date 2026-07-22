import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Text } from '@/components/atoms'
import { AuthSidebar, LoginForm } from '@/components/organisms'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const LoginPage = () => {
  return (
    <main className="h-screen overflow-hidden bg-cream-background text-deep-green">
      <div className="flex h-full flex-col lg:flex-row">
        <AuthSidebar />

        <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-8 lg:px-10 xl:px-14">
          <Card className="flex h-full max-h-[90vh] w-full max-w-xl flex-col">
            <div className="px-6 pt-6">
              <Link href="/">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-fit text-primary-green hover:text-deep-green"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>

            <CardHeader className="space-y-3 pt-4 text-center">
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
