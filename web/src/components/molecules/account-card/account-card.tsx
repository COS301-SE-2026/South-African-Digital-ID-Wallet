'use client'

import { AccountInfoRow, StatusPill } from '@/components/atoms'

export const AccountCard = () => {
  const rows = [
    { label: 'Full Name', value: 'Unathi Tshakalisa' },
    {
      label: 'ID Ending',
      value: <span className="font-semibold">••••084</span>,
    },
    {
      label: 'Email Address',
      value: 'unathi@example.com',
    },
    {
      label: 'Phone Number',
      value: '+27 82 123 4567',
    },
    {
      label: 'Date of Birth',
      value: '12 Feb 1998',
    },
    {
      label: 'Nationality',
      value: 'South African Citizen',
    },
    {
      label: 'Member Since',
      value: '14 Apr 2024',
    },
    {
      label: 'Last Login',
      value: 'Today, 09:42',
    },
  ]

  return (
    <div className="bg-card rounded-3xl border p-6 h-full flex flex-col">
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-foreground">Account</h2>

        <p className="text-muted-text mt-2">
          View your account information and manage your personal details.
        </p>
      </div>

      <div className="border rounded-3xl overflow-hidden flex-1">
        {rows.map((row) => (
          <AccountInfoRow key={row.label} label={row.label} value={row.value} />
        ))}

        <AccountInfoRow
          label="Account Status"
          border={false}
          value={<StatusPill intent="active">Active</StatusPill>}
        />
      </div>
    </div>
  )
}
