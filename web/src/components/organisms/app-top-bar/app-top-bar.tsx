import { Bell, ChevronDown, Menu } from 'lucide-react'
import type { AppTopBarProps } from '@/types/app-top-bar'

export const AppTopBar = ({
  title,
  description,
  user,
  showNotifications = true,
  notificationCount = 0,
  onMenuClick,
}: Readonly<AppTopBarProps>) => {
  return (
    <header className="flex items-center justify-between px-5 py-5">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-full p-2 text-primary-green transition hover:bg-primary-green/10 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-deep-green">
            {title}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-text">
            {description}
          </p>
        </div>
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

        <button
          type="button"
          className="flex items-center gap-3 rounded-full bg-card px-3 py-2 shadow-sm ring-1 ring-border"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-deep-green text-xs font-extrabold text-clean-white">
            {user.initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-extrabold leading-tight text-text-primary">
              {user.name}
            </p>

            {user.subtitle && (
              <p className="text-xs font-medium text-muted-text">
                {user.subtitle}
              </p>
            )}
          </div>

          <ChevronDown className="h-4 w-4 text-muted-text" />
        </button>
      </div>
    </header>
  )
}
