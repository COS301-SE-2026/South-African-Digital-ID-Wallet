'use client'

import { FC } from 'react'

import { UpdateEmailCardProps } from './types'

export const UpdateEmailCard: FC<UpdateEmailCardProps> = ({ onAction }) => {
  return (
    <div className="bg-card rounded-3xl border p-6 flex flex-col">
      <h2 className="text-xl font-bold">Update Email</h2>

      <p className="text-muted-text mt-2 text-sm">
        Change the email address associated with your account.
      </p>

      <ul className="mt-5 space-y-2 text-sm text-muted-text flex-1">
        <li>✓ Change your email address</li>
        <li>✓ Verify your new email</li>
        <li>✓ Receive notifications</li>
      </ul>

      <button
        type="button"
        onClick={onAction}
        className="mt-6 w-full bg-primary rounded-2xl py-3 text-primary-foreground font-semibold"
      >
        Update Email
      </button>
    </div>
  )
}
