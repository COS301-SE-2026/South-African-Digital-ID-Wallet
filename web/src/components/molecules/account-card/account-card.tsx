'use client'

import { useQuery } from '@tanstack/react-query'

import { AccountInfoRow, StatusPill } from '@/components/atoms'
import { manageUserAccountService } from '@/services'

export const AccountCard = () => {
  const {
    data: account,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['manageUserAccount', 'me'],
    queryFn: () => manageUserAccountService.getMyAccount(),
  })

  if (loading) {
    return (
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="h-full rounded-[24px] bg-card p-6">
          <h2 className="text-3xl font-bold">Account</h2>
          <p className="mt-4 text-muted-text">Loading account information...</p>
        </div>
      </div>
    )
  }

  if (isError || !account) {
    return (
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="h-full rounded-[24px] bg-card p-6">
          <h2 className="text-3xl font-bold">Account</h2>
          <p className="mt-4 text-red-500">
            Failed to load account information.
          </p>
        </div>
      </div>
    )
  }

  if ('message' in account) {
    return (
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="h-full rounded-[24px] bg-card p-6">
          <h2 className="text-3xl font-bold">Account</h2>
          <p className="mt-4 text-muted-text">{account.message}</p>
        </div>
      </div>
    )
  }

  const rows = [
    {
      label: 'Full Name',
      value: account.fullName,
    },
    {
      label: 'ID Ending',
      value: <span className="font-semibold">••••{account.idEnding}</span>,
    },
    {
      label: 'Email Address',
      value: account.emailAddress || '-',
    },
    {
      label: 'Phone Number',
      value: account.phoneNumber || '-',
    },
    {
      label: 'Date of Birth',
      value: new Date(account.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    },
    {
      label: 'Member Since',
      value: new Date(account.memberSince).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    },
    {
      label: 'Last Login',
      value: account.lastLogin
        ? new Date(account.lastLogin).toLocaleString('en-GB')
        : 'Never',
    },
  ]
  return (
    <div className="h-full rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="flex h-full flex-col rounded-[24px] bg-card p-6">
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-foreground">Account</h2>

          <p className="mt-2 text-muted-text">
            View your account information and manage your personal details.
          </p>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border">
          {rows.map((row) => (
            <div key={row.label} className="flex w-full flex-1 items-center">
              <AccountInfoRow label={row.label} value={row.value} />
            </div>
          ))}

          <div className="flex w-full flex-1 items-center">
            <AccountInfoRow
              border={false}
              label="Account Status"
              value={
                <StatusPill
                  intent={
                    account.accountStatus === 'Activated'
                      ? 'active'
                      : 'inactive'
                  }
                >
                  {account.accountStatus}
                </StatusPill>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
