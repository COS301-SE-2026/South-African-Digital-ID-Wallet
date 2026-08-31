'use client'
import { FC } from 'react'
import { UpdateEmailCardProps } from './types'

export const UpdateEmailCard: FC<UpdateEmailCardProps> = ({ onAction }) => {
  return (
    <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="flex h-full flex-col rounded-[24px] bg-card p-6">
        <h2 className="text-xl font-bold">Update Email</h2>

        <p className="mt-2 text-sm text-muted-text">
          Change the email address associated with your account.
        </p>

        <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-text">
          <li>✓ Change your email address</li>
          <li>✓ Verify your new email</li>
          <li>✓ Receive notifications</li>
        </ul>

        <button
          type="button"
          onClick={onAction}
          className="mt-6 w-full rounded-2xl bg-primary py-3 font-semibold text-primary-foreground"
        >
          Update Email
        </button>
      </div>
    </div>
  )
}
