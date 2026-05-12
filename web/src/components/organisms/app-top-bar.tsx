import { Bell, ChevronDown } from 'lucide-react'

type TopBarUser = {
  name: string
  initials: string
  subtitle?: string
}

type AppTopBarProps = {
  title: string
  description: string
  user: TopBarUser
  showNotifications?: boolean
  notificationCount?: number
}

export function AppTopBar({
  title,
  description,
  user,
  showNotifications = true,
  notificationCount = 0,
}: Readonly<AppTopBarProps>) {
  return (
    <header className="flex items-center justify-between px-5 py-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-text">
          {description}
        </p>
      </div>

      <div className=" flex items-center gap-4">
        {showNotifications && (
          <button
            type="button"
            className="relative rounded-full p-2 text-primary-green transition hover:bg-primary-green/10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />

            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-success-green px-1 text-[10px] font-extrabold text-clean-white">
                {notificationCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
