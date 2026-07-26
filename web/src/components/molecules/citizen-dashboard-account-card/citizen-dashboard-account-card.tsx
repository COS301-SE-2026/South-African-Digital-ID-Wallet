'use client'

import * as React from 'react'
import Link from 'next/link'
import axios from 'axios'
import api from '@/lib/api'
import type { AppUser } from '@/components/molecules/citizen-dashboard-account-card/types'

export function AccountCardCitizenDashboard() {
  const [user, setUser] = React.useState<AppUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [noCitizenRecord, setNoCitizenRecord] = React.useState(false)

  React.useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data } = await api.get<AppUser>(
          '/api/dashboard-account-card/me'
        )

        setUser(data)
      } catch (error) {
        console.error('Failed to load account:', error)

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNoCitizenRecord(true)
        }
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

  if (noCitizenRecord) {
    return (
      <div className="bg-card rounded-3xl border p-4">
        <h2 className="text-sm font-bold">Your Account</h2>

        <p className="mt-3 text-sm text-muted-text">
          Activate your credentials to see your account information.
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-card rounded-3xl border p-4">
        <h2 className="text-sm font-bold">Your Account</h2>

        <p className="mt-3 text-sm text-muted-text">
          Unable to load account information.
        </p>
      </div>
    )
  }
  const fullName = `${user.names ?? ''} ${user.surname ?? ''}`.trim()
  const idSuffix = user.saId.slice(-4)
  const citizenship = user.citizenship
  const initials =
    `${user.names?.charAt(0) ?? ''}${user.surname?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className="bg-card rounded-3xl border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Your Account</h2>

        <Link
          href="/citizen/manage-user-account"
          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
        >
          Manage account
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-muted-text">{fullName}</div>

          <div className="mt-1 text-sm text-muted-text">
            ID ending &bull;&bull;&bull;&bull;{idSuffix}
          </div>

          <div className="mt-1 text-sm text-muted-text">{citizenship}</div>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
          {initials}
        </div>
      </div>
    </div>
  )
}
