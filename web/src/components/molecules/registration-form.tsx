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

  const [idError, setIdError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [usernameError, setUsernameError] = React.useState('')

  const validateUsername = (
    value: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (value.length < 10) {
      errors.push('• At least 10 characters')
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('• At least one capital letter (A-Z)')
    }
    if (!/[a-z]/.test(value)) {
      errors.push('• At least one lowercase letter (a-z)')
    }
    if (!/[0-9]/.test(value)) {
      errors.push('• At least one numerical digit (0-9)')
    }
    if (!/[!@#$%^&*_+\-=.<>?~]/.test(value)) {
      errors.push('• At least one special character: !@#$%^&*_-+=.<>?~')
    }
    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    let hasError = false

    if (idnumber.length !== 13) {
      setIdError('ID number must be exactly 13 characters')
      hasError = true
    } else {
      setIdError('')
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      setUsernameError(usernameValidation.errors.join('\n'))
      hasError = true
    } else {
      setUsernameError('')
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      hasError = true
    } else {
      setPasswordError('')
    }

    if (hasError) {
      return
    }

    const data = { idnumber, password, username }
    onSubmitAction?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          ID Number:
        </label>
        <input
          type="text"
          value={idnumber}
          onChange={(e) => {
            setIdnumber(e.target.value)
            setIdError('')
          }}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
        {idError && (
          <p className="mt-2 text-sm text-red-600 font-medium">{idError}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Username:
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setUsernameError('')
          }}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
        {usernameError && (
          <div className="mt-2 text-sm text-red-600 font-medium whitespace-pre-line">
            {usernameError}
          </div>
        )}
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
      </div>

      <div>
        <label className="block text-lg font-bold text-primary-green md:text-xl">
          Re-enter Password:
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setPasswordError('')
          }}
          className="mt-1 w-full rounded-md border border-border-grey px-4 py-3 focus:border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green/20"
          required
        />
        {passwordError && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {passwordError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 rounded-md bg-primary-green px-4 py-2 text-base text-clean-white transition-colors hover:bg-deep-green"
          type="submit"
        >
          <User className="h-5 w-5" />
          Register
        </button>
      </div>
    </form>
  )
}
