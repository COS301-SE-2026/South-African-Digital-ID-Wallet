import { AuthSidebar, LoginCard } from '@/components/organisms'

export const LoginPage = () => {
  return (
    <main className="min-h-screen bg-cream-background text-deep-green">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex flex-1 items-start justify-center px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:px-10 xl:px-14">
          <LoginCard className="w-full max-w-lg" />
        </div>
      </div>
    </main>
  )
}
