import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Subtitle, Title } from '@/components/atoms'
import { LoginForm } from '@/components/molecules'

type LoginCardProps = {
  className?: string
  title?: string
  subtitle?: string
}

export function LoginCard({
  className,
  title = 'Welcome back',
  subtitle = 'Sign in to continue to Flash ID.',
}: Readonly<LoginCardProps>) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2 text-center">
        <Title titleSize="h2" className="text-center">
          {title}
        </Title>
        <Subtitle subtitleSize="md" className="text-center">
          {subtitle}
        </Subtitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <LoginForm />
      </CardContent>
    </Card>
  )
}
