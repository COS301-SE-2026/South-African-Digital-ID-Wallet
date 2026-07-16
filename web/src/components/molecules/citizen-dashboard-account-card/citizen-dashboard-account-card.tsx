import * as React from 'react'
import { ChevronRight } from 'lucide-react'
import { AvatarInitials } from '@/components/atoms/avatar-citizen-dashboard/avatar-initials'
import type { AppUser } from '@/components/molecules/citizen-dashboard-account-card/types'

interface AccountCardProps {
  user: AppUser | null
}

export function AccountCardCitizenDashboard({ user }: AccountCardProps) {
  const initials = `${user?.names?.[0] ?? 'U'}${user?.surname?.[0] ?? ''}`
  const fullName = user
    ? `${user.names ?? ''} ${user.surname ?? ''}`.trim()
    : 'Guest User'
  const idSuffix = user?.userId ? String(user.userId).slice(-3) : '084'
  const citizenship = user?.citizenship ?? 'South African Citizen'
  const memberSince = user?.memberSince ?? '12 Feb 2024'

  return (
    <div className="bg-card rounded-3xl border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Your Account</h2>

        <a
          href="#"
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          Manage account
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
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
