'use client'
import { FC } from 'react'
import { UpdatePasswordCardProps } from './types'

export const UpdatePasswordCard: FC<UpdatePasswordCardProps> = ({
  onAction,
}) => {
  return (
    <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="flex h-full flex-col rounded-[24px] bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mt-1 text-xl font-bold text-deep-green">
              Update Password
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-5 text-text-primary">
          Keep your account secure with a strong password.
        </p>

        <ul className="mt-5 flex-1 space-y-2.5 text-sm text-text-primary">
          <li className="flex items-center gap-2">
            <span className="text-primary-green">✓</span>
            Change your password
          </li>

          <li className="flex items-center gap-2">
            <span className="text-primary-green">✓</span>
            Protect your account
          </li>

          <li className="flex items-center gap-2">
            <span className="text-primary-green">✓</span>
            Improve security
          </li>
        </ul>

        <button
          type="button"
          onClick={onAction}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary-green py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-green/90 hover:shadow-md"
        >
          Update Password
        </button>
      </div>
    </div>
  )
}
