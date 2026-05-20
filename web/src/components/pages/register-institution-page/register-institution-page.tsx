import { AppSidebar, RegisterInstitutionForm } from '@/components/organisms'
import { citizenNavSections } from '@/config/navigation'
import { Card, CardContent } from '@/components/ui/card'

const SIDEBAR_USER = {
  name: 'Institution',
  initials: 'IN',
  idLabel: 'Institution',
}

export const RegisterInstitutionPage = () => {
  return (
    <main className="min-h-screen bg-cream-background text-deep-green">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AppSidebar navSections={citizenNavSections} user={SIDEBAR_USER} />
        <div className="flex flex-1 p-6 sm:p-5 lg:p-5">
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
