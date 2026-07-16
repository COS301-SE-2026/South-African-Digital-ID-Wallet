import * as React from 'react'
import { Bell, X } from 'lucide-react'
import type { NotificationItem } from '@/components/molecules/notifications-list/types'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'

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

      <DashboardModal
        open={showAllNotifications}
        title="All Notifications"
        onClose={() => setShowAllNotifications(false)}
      >
        <div className="space-y-4">
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
      </DashboardModal>
    </>
  )
}
