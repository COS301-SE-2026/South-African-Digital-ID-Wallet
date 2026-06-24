'use client'

import * as React from 'react'
import Link from 'next/link'
import { User, CircleUserRound, LockKeyhole, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import type { RegistrationFormProps } from '@/types/registration-form.types'

const RequirementList = ({
  items,
}: {
  items: { label: string; met: boolean }[]
}) => {
  const errors = items.filter((item) => !item.met)
  if (errors.length === 0) return null

  return (
    <div className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-0.5">
      {errors.map((item) => (
        <p key={item.label} className="text-xs leading-snug text-destructive">
          • {item.label}
        </p>
      ))}
    </div>
  )
}

export const RegistrationForm = ({
  onSubmitAction,
}: Readonly<RegistrationFormProps>) => {
  const [idnumber, setIdnumber] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [activationCode, setActivationCode] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)

  const stripSpaces = (value: string) => value.replace(/\s+/g, '')

  const idRequirements = [
    { label: 'Invalid South African ID', met: /^\d{13}$/.test(idnumber) },
  ]

  const usernameRequirements = [
    { label: 'At least 8 characters', met: username.length >= 8 },
  ]

  const passwordRequirements = [
    { label: 'At least 10 characters', met: password.length >= 10 },
    { label: 'At least 1 capital letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least 1 digit (0-9)', met: /[0-9]/.test(password) },
    { label: 'At least 1 lowercase letter (a-z)', met: /[a-z]/.test(password) },
    {
      label: 'At least 1 special character (!@#$%^&*)',
      met: /[!@#$%^&*_+\-=.<>?~]/.test(password),
    },
  ]

  const confirmRequirements = [
    {
      label: 'Must match the password above',
      met: confirmPassword.length > 0 && confirmPassword === password,
    },
  ]

  const isFormValid =
    idRequirements.every((r) => r.met) &&
    usernameRequirements.every((r) => r.met) &&
    passwordRequirements.every((r) => r.met) &&
    confirmRequirements.every((r) => r.met)

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    setSubmitted(true)
    if (!isFormValid) return
    onSubmitAction?.({
      idnumber,
      username,
      password,
      activationCode,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ID Number */}
      <div>
        <div className="relative">
          <CircleUserRound className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="ID number:"
            type="text"
            value={idnumber}
            onChange={(e) => setIdnumber(stripSpaces(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Enter your 13-digit ID number"
            className="pl-11"
            required
          />
        </div>
        {submitted && <RequirementList items={idRequirements} />}
      </div>

      {/* Username */}
      <div>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="Username:"
            type="text"
            value={username}
            onChange={(e) => setUsername(stripSpaces(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Choose a username"
            className="pl-11"
            required
          />
        </div>
        {submitted && <RequirementList items={usernameRequirements} />}
      </div>

      {/* Password */}
      <div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="Password:"
            type="password"
            value={password}
            onChange={(e) => setPassword(stripSpaces(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Enter your password"
            className="pl-11"
            required
          />
        </div>
        {submitted && <RequirementList items={passwordRequirements} />}
      </div>

      {/* Verify Password */}
      <div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="Verify password:"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(stripSpaces(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Re-enter your password"
            className="pl-11"
            required
          />
        </div>
        {submitted && <RequirementList items={confirmRequirements} />}
      </div>

      {/* Submit */}
      <div className="space-y-4 pt-1">
        <Button type="submit" className="w-full gap-2">
          <User className="h-5 w-5" />
          Create account
        </Button>
        <Text variant="sub-sm" className="text-center">
          Already have an account?{' '}
          <Link
            href="/"
            className="font-semibold text-primary-green hover:underline"
          >
            Log in
          </Link>
        </Text>
      </div>
    </form>
  )
}
