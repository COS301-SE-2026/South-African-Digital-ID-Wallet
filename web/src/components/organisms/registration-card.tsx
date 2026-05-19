import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Subtitle, Title } from '@/components/atoms'
import { RegistrationForm } from '@/components/molecules'
import type { RegistrationCardProps } from '@/types/registration-card.types'

export const RegistrationCard = ({
  className,
  title = 'Welcome',
  subtitle = 'Create your FlashID account.',
}: Readonly<RegistrationCardProps>) => {
  return (
    <Card className={className}>
      <CardHeader className="space-y-3 pt-8 text-center">
        <Title titleSize="h1" className="text-center text-4xl md:text-5xl">
          {title}
        </Title>
        <Subtitle subtitleSize="lg" className="text-center text-xl md:text-2xl">
          {subtitle}
        </Subtitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center pb-8">
        <RegistrationForm />
      </CardContent>
    </Card>
  )
}
