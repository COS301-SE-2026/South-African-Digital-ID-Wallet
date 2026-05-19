'use client'

import * as React from 'react'
import { User } from 'lucide-react'
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
        <input
          type="text"
          value={idnumber}
          onChange={(e) => setIdnumber(e.target.value)}
          placeholder="Enter your ID number"
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
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
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
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

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 rounded-md bg-primary-green px-4 py-2 text-base text-clean-white transition-colors hover:bg-deep-green"
          type="submit"
        >
          <User className="h-5 w-5" />
          Create account
        </button>
      </div>
    </form>
  )
}
