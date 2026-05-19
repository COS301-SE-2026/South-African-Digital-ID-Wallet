import { AuthSidebar, RegisterInstitutionForm } from '@/components/organisms'
import { Card, CardContent } from '@/components/ui/card'

export const RegisterInstitutionPage = () => {
  return (
    <main className="min-h-screen bg-cream-background text-deep-green">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
          <Card className="w-full max-w-md">
            <CardContent>
              <RegisterInstitutionForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
