import { GovAdminRegistrationForm } from '@/components/organisms'
import { Card, CardContent } from '@/components/ui/card'

export const GovAdminRegisterAdminPage = () => {
  return (
    <main className="h-full bg-cream-background text-deep-green">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="flex flex-1 overflow-hidden p-6">
          <Card className="flex w-full flex-1 items-center justify-center rounded-2xl">
            <CardContent className="w-full max-w-3xl">
              <GovAdminRegistrationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
