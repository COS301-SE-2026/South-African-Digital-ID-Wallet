import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { LoginForm } from '@/components/molecules'
import type { LoginCardProps } from '@/types/login-card'

export const LoginCard = ({
  className,
  title = 'Welcome back',
  subtitle = 'Log into your FlashID account.',
}: Readonly<LoginCardProps>) => {
  return (
    <Card className={className} size="sm">
      <CardHeader className="space-y-2 pt-6 text-center sm:pt-8">
        <Text
          variant="h1"
          className="text-center text-3xl leading-tight sm:text-4xl md:text-5xl"
        >
          {title}
        </Text>
        <Text
          variant="sub-lg"
          className="text-center text-base sm:text-lg md:text-xl"
        >
          {subtitle}
        </Text>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center pb-6 sm:pb-8">
        <LoginForm />
      </CardContent>
    </Card>
  )
}
