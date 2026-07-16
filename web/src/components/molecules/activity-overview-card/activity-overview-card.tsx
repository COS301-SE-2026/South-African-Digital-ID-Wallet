import * as React from 'react'
import { CheckCircle2, IdCard, Lock, X } from 'lucide-react'
import type { ActivityLogItem } from '@/components/molecules/activity-overview-card/types'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'

const lastActivity: ActivityLogItem[] = [
  {
    id: '1',
    title: 'Credential verified by Bank Official',
    timestamp: 'Today • 09:42',
    icon: CheckCircle2,
    tone: 'green',
  },
  {
    id: '2',
    title: "Driver's Licence credential issued",
    timestamp: 'Yesterday • 15:22',
    icon: IdCard,
    tone: 'blue',
  },
  {
    id: '3',
    title: 'Biometric login successful',
    timestamp: 'Today • 08:14',
    icon: Lock,
    tone: 'amber',
  },
]

export function ActivityOverviewCard() {
  const [showAllActivity, setShowAllActivity] = React.useState(false)

  return (
    <>
      <div className="bg-card rounded-3xl border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Activity Overview</h2>

          <button
            onClick={() => setShowAllActivity(true)}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            View all
          </button>
        </div>

        <div className="mt-4 h-[150px] overflow-y-auto pr-2">
          <ul className="space-y-3">
            {lastActivity.map((item) => {
              return (
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
              )
            })}
          </ul>
        </div>
      </div>

      <DashboardModal
        open={showAllActivity}
        title="Activity History"
        onClose={() => setShowAllActivity(false)}
      >
        <div className="space-y-4">
          {lastActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl border p-5"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>

                <p className="mt-1 text-sm text-muted-text">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </DashboardModal>
    </>
  )
}
