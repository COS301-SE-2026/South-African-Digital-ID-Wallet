'use client'
import { useState } from 'react'
import {
  HeartPulse,
  IdCard,
  QrCode,
  UserPlus,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'

import type {
  ActivityCardProps,
  OfficialActivityItem,
  OfficialActivityLogItem,
  OfficialActivityTone,
} from './types'

// The card shows the latest few; "View all" shows everything the page fetched
const CARD_ITEM_LIMIT = 5

const TONE_CLASSES: Record<OfficialActivityTone, string> = {
  green: 'bg-primary-green/10 text-primary-green',
  blue: 'bg-national-blue/10 text-national-blue',
  red: 'bg-national-red/10 text-national-red',
}

// Record keyed by event type, so TypeScript flags any new event that has no icon
const EVENT_STYLES: Record<
  OfficialActivityItem['eventType'],
  { icon: LucideIcon; tone: OfficialActivityTone }
> = {
  OnboardCitizen: { icon: UserPlus, tone: 'green' },
  OnboardCitizenFailed: { icon: UserX, tone: 'red' },
  CredentialIssued: { icon: IdCard, tone: 'green' },
  CredentialVerified: { icon: QrCode, tone: 'blue' },
  CitizenVerificationFailed: { icon: QrCode, tone: 'red' },
  OfflineCredentialVerified: { icon: QrCode, tone: 'blue' },
  OfflineVerificationRejected: { icon: QrCode, tone: 'red' },
  EmergencyProfileAccessed: { icon: HeartPulse, tone: 'blue' },
  EmergencyProfileAccessFailed: { icon: HeartPulse, tone: 'red' },
}

// Fallback in case the backend adds an event before the frontend knows about it
const DEFAULT_STYLE = { icon: UserPlus, tone: 'green' as const }

const toLogItem = (item: OfficialActivityItem): OfficialActivityLogItem => {
  const style = EVENT_STYLES[item.eventType] ?? DEFAULT_STYLE
  return {
    id: item.id,
    summary: item.summary,
    timestamp: new Date(item.createdAt).toLocaleString(),
    icon: style.icon,
    tone: style.tone,
  }
}

// One row layout shared by the card and the "View all" modal
const ActivityRow = ({ item }: { item: OfficialActivityLogItem }) => (
  <li className="flex items-center gap-3 rounded-2xl border border-black/20 p-3">
    <div className={`shrink-0 rounded-xl p-2 ${TONE_CLASSES[item.tone]}`}>
      <item.icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold leading-5 text-text-primary">
        {item.summary}
      </p>
      <p className="mt-1 text-xs text-muted-text">{item.timestamp}</p>
    </div>
  </li>
)

export function ActivityCard({ activity }: ActivityCardProps) {
  const [showAllActivity, setShowAllActivity] = useState(false)
  const items = activity.map(toLogItem)
  const cardItems = items.slice(0, CARD_ITEM_LIMIT)

  return (
    <>
      <div className="h-full rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="flex h-full min-h-0 flex-col rounded-[24px] bg-card p-6">
          <div className="flex shrink-0 items-center justify-between">
            <h2 className="text-lg font-extrabold text-deep-green">
              My recent work
            </h2>
            {items.length > CARD_ITEM_LIMIT ? (
              <Button
                variant="text"
                className="h-auto w-auto px-0 text-sm font-bold text-deep-green hover:text-deep-green"
                onClick={() => setShowAllActivity(true)}
              >
                View all
              </Button>
            ) : null}
          </div>
          <p className="mt-1 shrink-0 text-xs text-muted-text">
            Citizens you onboarded, verified or assisted.
          </p>
          {cardItems.length === 0 ? (
            <div className="flex min-h-[280px] flex-1 items-center justify-center">
              <p className="text-sm text-muted-text">No citizen work yet.</p>
            </div>
          ) : (
            <div className="mt-4 max-h-[500px] min-h-0 flex-1 overflow-y-auto pr-1">
              <ul className="space-y-3">
                {cardItems.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <DashboardModal
        open={showAllActivity}
        title="My recent work"
        onClose={() => setShowAllActivity(false)}
      >
        <ul className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      </DashboardModal>
    </>
  )
}
