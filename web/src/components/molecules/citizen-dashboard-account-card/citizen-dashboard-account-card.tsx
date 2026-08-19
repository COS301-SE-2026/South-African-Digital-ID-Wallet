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
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-card p-5">
          <h2 className="text-sm font-bold text-deep-green">Your Account</h2>

          <p className="mt-3 text-sm text-muted-text">Loading account...</p>
        </div>
      </div>
    )
  }

  if (noCitizenRecord) {
    return (
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/15">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-gold" />
            </div>

            <h2 className="text-sm font-bold text-deep-green">Your Account</h2>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-text">
            Activate your credentials to see your account information.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="rounded-[24px] bg-card p-5">
          <h2 className="text-sm font-bold text-deep-green">Your Account</h2>

          <p className="mt-3 text-sm text-muted-text">
            Unable to load account information.
          </p>
        </div>
      </div>
    )
  }
  const fullName = `${user.names ?? ''} ${user.surname ?? ''}`.trim()
  const idSuffix = user.saId.slice(-4)
  const initials =
    `${user.names?.charAt(0) ?? ''}${user.surname?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div className="group relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-deep-green/10">
      <div className="relative overflow-hidden rounded-[24px] bg-card p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-gold/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="mt-1 text-base font-extrabold text-deep-green">
                Your Account
              </h2>
            </div>
            <Link
              href="/citizen/manage-user-account"
              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-deep-green transition hover:bg-accent-gold/10 hover:text-primary-green"
            >
              Manage account
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-extrabold text-text-primary">
                {fullName}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-national-blue" />
                <p className="text-sm font-medium text-muted-text">
                  ID ending ••••{idSuffix}
                </p>
              </div>
            </div>

            <div className="relative flex-shrink-0">
              <div className="rounded-full bg-gradient-to-br from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-deep-green text-lg font-extrabold text-clean-white">
                  {initials}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex h-1 overflow-hidden rounded-full">
            <div className="flex-[2] bg-primary-green" />
            <div className="flex-1 bg-accent-gold" />
            <div className="flex-1 bg-national-red" />
            <div className="flex-1 bg-national-blue" />
          </div>
        </div>
      </div>
    </div>
  )
}
