'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'

import api from '@/lib/api'
import type { NotificationItem } from '@/components/molecules/notifications-list/types'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms/text'

export function NotificationsList() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNotifications, setShowAllNotifications] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get<NotificationItem[]>(
          '/api/notifications/me'
        )

        setNotifications(data)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-3xl border p-6">
        <Text as="h2" variant="h4">
          Notifications
        </Text>

        <p className="mt-4 text-sm text-muted-text">Loading notifications...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <Text as="h2" variant="h4">
            Notifications
          </Text>

          <Button
            variant="link"
            size="sm"
            className="text-primary-green hover:text-green-800"
            onClick={() => setShowAllNotifications(true)}
          >
            View all
          </Button>
        </div>

        {notifications.length === 0 ? (
          <p className="mt-4 text-sm text-muted-text">
            No notifications found.
          </p>
        ) : (
          <div className="mt-4 h-[120px] overflow-y-auto pr-2">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3"
                >
                  <Bell className="h-4 w-4 flex-shrink-0 text-amber-600" />

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium leading-4 text-amber-900">
                      {notification.title}
                    </div>

                    <div className="mt-0.5 text-[11px] leading-4 text-amber-700">
                      {notification.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DashboardModal
        open={showAllNotifications}
        title="All Notifications"
        onClose={() => setShowAllNotifications(false)}
      >
        {notifications.length === 0 ? (
          <p className="text-muted-text">No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5"
              >
                <Bell className="h-5 w-5 flex-shrink-0 text-amber-600" />

                <div className="flex-1">
                  <div className="font-semibold text-amber-900">
                    {notification.title}
                  </div>

                  <div className="mt-1 text-sm text-amber-700">
                    {notification.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardModal>
    </>
  )
}
