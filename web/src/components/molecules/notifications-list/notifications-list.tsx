import * as React from 'react'
import { Bell, X } from 'lucide-react'
import type { NotificationItem } from '@/components/molecules/notifications-list/types'

const notifications: NotificationItem[] = [
  {
    id: 'licence-expiry',
    title: "Driver's Licence expires in 7 days",
    description: 'Renew your licence to avoid penalties.',
    tone: 'warning',
  },
  {
    id: 'passport-expiry',
    title: 'Passport expires in 3 months',
    description: 'Consider renewing your passport.',
    tone: 'warning',
  },
  {
    id: 'vehicle-renewal',
    title: 'Vehicle licence renewal due1',
    description: 'Renew before the end of the month.',
    tone: 'warning',
  },
  {
    id: 'tax-reminder1',
    title: 'SARS filing reminder1',
    description: 'Tax filing season is now open.',
    tone: 'warning',
  },
  {
    id: 'tax-reminder2',
    title: 'SARS filing reminder2',
    description: 'Tax filing season is now open.',
    tone: 'warning',
  },
  {
    id: 'tax-reminder3',
    title: 'SARS filing reminder3',
    description: 'Tax filing season is now open.',
    tone: 'warning',
  },
  {
    id: 'tax-reminder4',
    title: 'SARS filing reminder4',
    description: 'Tax filing season is now open.',
    tone: 'warning',
  },
  {
    id: 'tax-reminder5',
    title: 'SARS filing reminder5',
    description: 'Tax filing season is now open.',
    tone: 'warning',
  },
  {
    id: 'tax-reminder6',
    title: 'SARS filing reminder6',
    description: 'Tax filing season is now open.',
    tone: 'warning',
  },
]

export function NotificationsList() {
  const [showAllNotifications, setShowAllNotifications] = React.useState(false)

  return (
    <>
      <div className="bg-card rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Notifications</h2>

          <button
            type="button"
            onClick={() => setShowAllNotifications(true)}
            className="text-sm font-semibold text-primary-green hover:text-green-800"
          >
            View all
          </button>
        </div>

        <div className="mt-4 h-[120px] overflow-y-auto pr-2">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3"
              >
                <Bell className="h-4 w-4 flex-shrink-0 text-amber-600" />

                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-amber-900 leading-4">
                    {notification.title}
                  </div>

                  <div className="text-[11px] text-amber-700 mt-0.5 leading-4">
                    {notification.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAllNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-card border shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-2xl font-bold">All Notifications</h2>

              <button
                onClick={() => setShowAllNotifications(false)}
                className="rounded-xl p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-100 p-5"
                >
                  <Bell className="h-5 w-5 flex-shrink-0 text-amber-600" />

                  <div className="flex-1">
                    <div className="font-semibold text-amber-900">
                      {notification.title}
                    </div>

                    <div className="text-sm text-amber-700 mt-1">
                      {notification.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t p-6">
              <button
                onClick={() => setShowAllNotifications(false)}
                className="rounded-xl bg-primary text-primary-foreground px-5 py-2 font-semibold hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
