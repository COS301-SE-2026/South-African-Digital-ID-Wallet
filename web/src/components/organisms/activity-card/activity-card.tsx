'use client'
import { useState } from 'react'
import { IdCard, QrCode, UserPlus, UserX } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'

import type { ActivityCardProps, OfficialActivityLogItem } from './types'

export function ActivityCard({ activity }: ActivityCardProps) {
  const [showAllActivity, setShowAllActivity] = useState(false)
  const mappedActivity: OfficialActivityLogItem[] = activity.map((item) => {
    switch (item.eventType) {
      case 'DriverLicenseIssued':
        return {
          id: item.id,
          details: item.details,
          timestamp: new Date(item.createdAt).toLocaleString(),
          icon: IdCard,
          tone: 'amber',
        }

      case 'QrCodeVerified':
        return {
          id: item.id,
          details: item.details,
          timestamp: new Date(item.createdAt).toLocaleString(),
          icon: QrCode,
          tone: 'blue',
        }

      case 'OnboardCitizenFailed':
        return {
          id: item.id,
          details: item.details,
          timestamp: new Date(item.createdAt).toLocaleString(),
          icon: UserX,
          tone: 'red',
        }

      case 'OnboardCitizen':
      default:
        return {
          id: item.id,
          details: item.details,
          timestamp: new Date(item.createdAt).toLocaleString(),
          icon: UserPlus,
          tone: 'green',
        }
    }
  })

  return (
    <>
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="flex min-h-0 flex-col rounded-[24px] bg-card p-6">
          <div className="flex shrink-0 items-center justify-between">
            <h2 className="text-lg font-extrabold text-deep-green">Activity</h2>
            <Button
              variant="text"
              className="h-auto w-auto px-0 text-sm font-bold text-deep-green hover:text-deep-green"
              onClick={() => setShowAllActivity(true)}
            >
              View all
            </Button>
          </div>
          <p className="mt-1 shrink-0 text-xs text-muted-text">
            Your recent actions and important updates.
          </p>
          {mappedActivity.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-sm text-muted-text">No activity found.</p>
            </div>
          ) : (
            <div className="mt-4 max-h-[500px] overflow-y-auto pr-1">
              <ul className="space-y-3">
                {mappedActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-black/20 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-5 text-text-primary">
                        {item.details}
                      </p>
                      <p className="mt-1 text-xs text-muted-text">
                        {item.timestamp}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <DashboardModal
        open={showAllActivity}
        title="Activity History"
        onClose={() => setShowAllActivity(false)}
      >
        {mappedActivity.length === 0 ? (
          <p className="text-muted-text">No activity found.</p>
        ) : (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
            {mappedActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-black p-3"
              >
                <div>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">
                    {item.details}
                  </p>
                  <p className="mt-1 text-xs text-muted-text">
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
