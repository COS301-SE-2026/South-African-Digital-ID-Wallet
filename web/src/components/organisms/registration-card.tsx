import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Subtitle, Title } from '@/components/atoms'
import { RegistrationForm } from '@/components/molecules'
import type { RegistrationCardProps } from '@/types/registration-card.types'

export const RegistrationCard = ({
  className,
  title = 'Create your account',
  subtitle = 'Register for your FlashID account',
}: Readonly<RegistrationCardProps>) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      {/* Header is fixed — does not scroll */}
      <CardHeader className="shrink-0 space-y-2 pt-10 text-center">
        <Title titleSize="h1" className="text-center text-3xl md:text-4xl">
          {title}
        </Title>
        <Subtitle subtitleSize="lg" className="text-center text-lg md:text-xl">
          {subtitle}
        </Subtitle>
      </CardHeader>

      {/* Content scrolls independently inside the fixed card */}
      <CardContent className="flex-1 overflow-y-auto pb-8">
        <RegistrationForm />
      </CardContent>
    </Card>
  )
}
