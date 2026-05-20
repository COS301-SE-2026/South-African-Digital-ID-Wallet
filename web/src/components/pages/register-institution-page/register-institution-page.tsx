import { AppSidebar, RegisterInstitutionForm } from '@/components/organisms'
import { Card, CardContent } from '@/components/ui/card'
import { citizenNavSections } from '@/config/navigation'

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
