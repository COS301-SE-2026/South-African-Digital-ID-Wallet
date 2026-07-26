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
      <div className="bg-card rounded-3xl border p-6">
        <h2 className="text-3xl font-bold">Account</h2>
        <p className="mt-4 text-muted-text">Loading account information...</p>
      </div>
    )
  }

  if (isError || !account) {
    return (
      <div className="bg-card rounded-3xl border p-6">
        <h2 className="text-3xl font-bold">Account</h2>
        <p className="mt-4 text-red-500">Failed to load account information.</p>
      </div>
    )
  }

  if ('message' in account) {
    return (
      <div className="bg-card rounded-3xl border p-6">
        <h2 className="text-3xl font-bold">Account</h2>
        <p className="mt-4 text-muted-text">{account.message}</p>
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
    <div className="bg-card rounded-3xl border p-6 flex flex-col h-full">
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-foreground">Account</h2>
        <p className="text-muted-text mt-2">
          View your account information and manage your personal details.
        </p>
      </div>

      <div className="border rounded-3xl overflow-hidden flex-1 flex flex-col">
        {rows.map((row) => (
          <div key={row.label} className="flex-1 flex items-center w-full">
            <AccountInfoRow label={row.label} value={row.value} />
          </div>
        ))}

        <div className="flex-1 flex items-center w-full">
          <AccountInfoRow
            border={false}
            label="Account Status"
            value={
              <StatusPill
                intent={
                  account.accountStatus === 'Activated' ? 'active' : 'inactive'
                }
              >
                {account.accountStatus}
              </StatusPill>
            }
          />
        </div>
      </div>
    </div>
  )
}
