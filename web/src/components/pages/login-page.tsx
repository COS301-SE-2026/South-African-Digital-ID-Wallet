import { AuthSidebar, LoginCard } from '@/components/organisms'
export const LoginPage = () => {
  return (
    <main className="min-h-screen bg-cream-background text-deep-green">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AuthSidebar />
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8 lg:px-10 xl:px-14">
          <LoginCard className="w-full max-w-xl min-h-136 lg:min-h-152" />
        </div>
      </div>
    </main>
  )
}
