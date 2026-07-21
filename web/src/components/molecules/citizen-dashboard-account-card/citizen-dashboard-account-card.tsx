'use client'

import * as React from 'react'

import api from '@/lib/api'

import type { AppUser } from '@/components/molecules/citizen-dashboard-account-card/types'

export function AccountCardCitizenDashboard() {
  const [user, setUser] = React.useState<AppUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data } = await api.get<AppUser>('/api/dashboard-account/me')
        setUser(data)
      } catch (error) {
        console.error('Failed to load account:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  if (loading) {
    return (
      <div className="bg-card rounded-3xl border p-4">
        <h2 className="text-sm font-bold">Your Account</h2>

        <p className="mt-3 text-sm text-muted-text">Loading account...</p>
      </div>
    )
  }

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
          <div className="text-muted-text text-sm">{fullName}</div>

          <div className="text-muted-text mt-0.5 text-sm">
            ID ending &bull;&bull;&bull;&bull;{idSuffix}
          </div>

          <div className="text-muted-text mt-0.5 text-sm">{citizenship}</div>
        </div>
      </div>
    </div>
  )
}
