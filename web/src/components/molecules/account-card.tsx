'use client'

import { AccountInfoRow, StatusPill } from '@/components/atoms'

export const AccountCard = () => {
  const rows = [
    { label: 'Full Name', value: 'Unathi Tshakalisa' },
    {
      label: 'ID Ending',
      value: <span className="font-semibold">••••084</span>,
    },
    { label: 'Email Address', value: 'unathi@example.com' },
    { label: 'Phone Number', value: '+27 82 123 4567' },
    { label: 'Date of Birth', value: '12 Feb 1998' },
    { label: 'Nationality', value: 'South African Citizen' },
    { label: 'Member Since', value: '14 Apr 2024' },
    { label: 'Last Login', value: 'Today, 09:42' },
  ]

  return (
    <div className="bg-card rounded-3xl border p-4 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-2">1. Your Account</h2>
      <p className="text-muted-text mb-3 text-sm">
        View your account information and update your password.
      </p>

      <div className="border rounded-3xl overflow-hidden flex-1 flex flex-col justify-between">
        {rows.map((r) => (
          <AccountInfoRow key={r.label} label={r.label} value={r.value} />
        ))}

        <AccountInfoRow
          label="Account Status"
          value={<StatusPill intent="active">Active</StatusPill>}
          border={false}
        />
      </div>
    </div>
  )
}
