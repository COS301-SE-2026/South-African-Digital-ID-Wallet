import { RegisterInstitutionForm } from '@/components/organisms'
import { Card, CardContent } from '@/components/ui/card'

export const RegisterInstitutionPage = () => {
  return (
    <main className="h-full bg-cream-background text-deep-green">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="flex flex-1 p-6 sm:p-5 lg:p-5 overflow-hidden">
          <Card className="flex w-full flex-1 items-center justify-center rounded-2xl">
            <CardContent className="w-full max-w-xl">
              <RegisterInstitutionForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
