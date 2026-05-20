import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { LoginForm } from '@/components/molecules'
import type { LoginCardProps } from '@/types/login-card.types'

export const LoginCard = ({
  className,
  title = 'Welcome back',
  subtitle = 'Log into your FlashID account.',
}: Readonly<LoginCardProps>) => {
  return (
    <Card className={className}>
      <CardHeader className="space-y-3 pt-8 text-center">
        <Text variant="h1" className="text-center text-4xl md:text-5xl">
          {title}
        </Text>
        <Text variant="sub-lg" className="text-center text-xl md:text-2xl">
          {subtitle}
        </Text>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center pb-8">
        <LoginForm />
      </CardContent>
    </Card>
  )
}
