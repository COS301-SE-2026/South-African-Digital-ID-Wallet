import { RegistrationSidebar, RegistrationCard } from '@/components/organisms'

export const CitizenRegistrationPage = () => {
  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className="flex h-full flex-col lg:flex-row">
        <RegistrationSidebar />
        {/* Right panel — fixed, no scroll. Card fills the padded area. */}
        <div className="flex h-full flex-1 items-center justify-center px-6 py-8 sm:px-8 lg:px-10 xl:px-14">
          <RegistrationCard className="h-full w-full max-w-xl" />
        </div>
      </div>
    </main>
  )
}
