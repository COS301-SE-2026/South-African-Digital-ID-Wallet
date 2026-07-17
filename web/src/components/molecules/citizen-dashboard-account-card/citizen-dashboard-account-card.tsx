import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import type {
  AppUser,
  AccountCardProps,
} from '@/components/molecules/citizen-dashboard-account-card/types'

export function AccountCardCitizenDashboard({ user }: AccountCardProps) {
  const fullName = user
    ? `${user.names ?? ''} ${user.surname ?? ''}`.trim()
    : 'Guest User'
  const idSuffix = user?.userId ? String(user.userId).slice(-3) : '084'
  const citizenship = user?.citizenship ?? 'South African Citizen'

  return (
    <div className="bg-card rounded-3xl border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Your Account</h2>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          Manage account
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="text-muted-text text-sm">Lebron James{fullName}</div>

          <div className="text-muted-text text-sm mt-0.5">
            ID ending &bull;&bull;&bull;&bull;{idSuffix}
          </div>

          <div className="text-muted-text text-sm mt-0.5">{citizenship}</div>
        </div>
      </div>
    </div>
  )
}
