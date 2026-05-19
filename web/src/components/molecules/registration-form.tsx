'use client'

import * as React from 'react'
import Link from 'next/link'
import { LockKeyhole, User, CircleUserRound } from 'lucide-react'
import type { RegistrationFormProps } from '@/types/registration-form.types'

export const RegistrationForm = ({
  onSubmitAction,
}: Readonly<RegistrationFormProps>) => {
  const [idnumber, setIdnumber] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [username, setUsername] = React.useState('')

  const usernameRequirementStatuses = [
    { label: 'At least 8 characters', met: username.length >= 8 },
  ]

  const passwordRequirementStatuses = [
    { label: 'At least 10 characters', met: password.length >= 10 },
    {
      label: 'At least one capital letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'At least one lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      label: 'At least one numerical digit (0-9)',
      met: /[0-9]/.test(password),
    },
    {
      label: 'At least one special character: !@#$%^&*_-+=.<>?~',
      met: /[!@#$%^&*_+\-=.<>?~]/.test(password),
    },
  ]

  const idRequirementStatuses = [
    { label: 'Exactly 13 characters', met: idnumber.length === 13 },
  ]

  const confirmPasswordRequirementStatuses = [
    {
      label: 'Must match the password above',
      met: confirmPassword.length > 0 && confirmPassword === password,
    },
  ]

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    const isFormValid =
      idRequirementStatuses.every((item) => item.met) &&
      usernameRequirementStatuses.every((item) => item.met) &&
      passwordRequirementStatuses.every((item) => item.met) &&
      confirmPasswordRequirementStatuses.every((item) => item.met)

    if (!isFormValid) {
      return
    }

    const data = { idnumber, password, username }
    onSubmitAction?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          ID number:
        </label>
        <div className="relative mt-1">
          <CircleUserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-mid-grey" />
          <input
            type="text"
            value={idnumber}
            onChange={(e) => setIdnumber(e.target.value)}
            placeholder="Enter your ID number"
            className="w-full rounded-md border border-border-grey py-3 pl-11 pr-4 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
            required
          />
        </div>
        <div className="mt-2 space-y-1 text-sm">
          {idRequirementStatuses.map((item) => (
            <div
              key={item.label}
              className={item.met ? 'text-success-green' : 'text-red-600'}
            >
              • {item.label}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Password:
        </label>
        <div className="relative mt-1">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-mid-grey" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-md border border-border-grey py-3 pl-11 pr-4 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
            required
          />
        </div>
        <div className="mt-2 space-y-1 text-sm">
          {passwordRequirementStatuses.map((item) => (
            <div
              key={item.label}
              className={item.met ? 'text-success-green' : 'text-red-600'}
            >
              • {item.label}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Verify password:
        </label>
        <div className="relative mt-1">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-mid-grey" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full rounded-md border border-border-grey py-3 pl-11 pr-4 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
            required
          />
        </div>
        <div className="mt-2 space-y-1 text-sm">
          {confirmPasswordRequirementStatuses.map((item) => (
            <div
              key={item.label}
              className={item.met ? 'text-success-green' : 'text-red-600'}
            >
              • {item.label}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Username:
        </label>
        <div className="relative mt-1">
          <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-mid-grey" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full rounded-md border border-border-grey py-3 pl-11 pr-4 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
            required
          />
        </div>
        <div className="mt-2 space-y-1 text-sm">
          {usernameRequirementStatuses.map((item) => (
            <div
              key={item.label}
              className={item.met ? 'text-success-green' : 'text-red-600'}
            >
              • {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary-green px-4 py-3 text-base text-clean-white transition-colors hover:bg-deep-green"
          type="submit"
        >
          <User className="h-5 w-5" />
          Create account
        </button>
        <p className="text-center text-sm text-muted-text">
          Already have an account?{' '}
          <Link
            href="/"
            className="font-semibold text-primary-green hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </form>
  )
}
