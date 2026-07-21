'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, IdCard, Lock } from 'lucide-react'

import api from '@/lib/api'
import type {
  ActivityLogItem,
  ActivityItem,
} from '@/components/molecules/activity-overview-card/types'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import { Button } from '@/components/ui/button'

export function ActivityOverviewCard() {
  const [lastActivity, setLastActivity] = useState<ActivityLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllActivity, setShowAllActivity] = useState(false)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/api/activity/me')

        const mappedActivity: ActivityLogItem[] = data.map(
          (activity: ActivityItem) => {
            let icon = CheckCircle2
            let tone: 'green' | 'blue' | 'amber' = 'green'

            switch ((activity.type ?? '').toLowerCase()) {
              case 'driverlicenseissued':
              case 'licenseissued':
                icon = IdCard
                tone = 'blue'
                break

              case 'login':
              case 'biometriclogin':
                icon = Lock
                tone = 'amber'
                break

              default:
                icon = CheckCircle2
                tone = 'green'
            }

            return {
              id: activity.id,
              title: activity.title,
              timestamp: new Date(activity.timestamp).toLocaleString(),
              icon,
              tone,
            }
          }
        )

        setLastActivity(mappedActivity)
      } catch (error) {
        console.error('Failed to load activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-3xl border p-6">
        <h2 className="text-lg font-bold">Activity Overview</h2>

        <p className="mt-4 text-sm text-muted-text">Loading activity...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Activity Overview</h2>

          <Button
            variant="link"
            size="sm"
            className="text-green-700 hover:text-green-800"
            onClick={() => setShowAllActivity(true)}
          >
            View all
          </Button>
        </div>

        {lastActivity.length === 0 ? (
          <p className="mt-4 text-sm text-muted-text">No activity found.</p>
        ) : (
          <div className="mt-4 h-[150px] overflow-y-auto pr-2">
            <ul className="space-y-3">
              {lastActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl border bg-muted/20 p-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium leading-4">
                      {item.title}
                    </div>

                    <div className="mt-1 text-[11px] text-muted-text">
                      {item.timestamp}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <DashboardModal
        open={showAllActivity}
        title="Activity History"
        onClose={() => setShowAllActivity(false)}
      >
        {lastActivity.length === 0 ? (
          <p className="text-muted-text">No activity found.</p>
        ) : (
          <div className="space-y-4">
            {lastActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border p-5"
              >
                <div className="rounded-2xl bg-muted p-4">
                  <item.icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>

                  <p className="mt-1 text-sm text-muted-text">
                    {item.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardModal>
    </>
  )
}
