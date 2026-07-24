'use client'

import { FC } from 'react'

import { UpdatePasswordCardProps } from './types'

export const UpdatePasswordCard: FC<UpdatePasswordCardProps> = ({
  onAction,
}) => {
  return (
    <div className="bg-card rounded-3xl border p-6 flex flex-col">
      <h2 className="text-xl font-bold">Update Password</h2>

      <p className="text-muted-text mt-2 text-sm">
        Keep your account secure with a strong password.
      </p>

      <ul className="mt-5 space-y-2 text-sm text-muted-text flex-1">
        <li>✓ Change your password</li>
        <li>✓ Protect your account</li>
        <li>✓ Improve security</li>
      </ul>

      <button
        onClick={onAction}
        className="mt-6 w-full bg-primary rounded-2xl py-3 text-primary-foreground font-semibold"
      >
        Update Password
      </button>
    </div>
  )
}
