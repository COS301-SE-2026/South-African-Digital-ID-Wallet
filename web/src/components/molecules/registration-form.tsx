'use client'

import * as React from 'react'
import Link from 'next/link'
import { LockKeyhole, User, CircleUserRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { RegistrationFormProps } from '@/types/registration-form.types'

const RequirementList = ({
  items,
}: {
  items: { label: string; met: boolean }[]
}) => (
  <div className="mt-2 space-y-1 text-sm">
    {items.map((item) => (
      <div
        key={item.label}
        className={item.met ? 'text-success-green' : 'text-destructive'}
      >
        • {item.label}
      </div>
    ))}
  </div>
)

export const RegistrationForm = ({
  onSubmitAction,
}: Readonly<RegistrationFormProps>) => {
  const [idnumber, setIdnumber] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [username, setUsername] = React.useState('')

  const stripSpaces = (value: string) => value.replace(/\s+/g, '')

  const idRequirementStatuses = [
    { label: 'Exactly 13 characters', met: idnumber.length === 13 },
  ]

  const passwordRequirementStatuses = [
    { label: 'At least 10 characters', met: password.length >= 10 },
    { label: 'At least one capital letter (A-Z)', met: /[A-Z]/.test(password) },
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

  const confirmPasswordRequirementStatuses = [
    {
      label: 'Must match the password above',
      met: confirmPassword.length > 0 && confirmPassword === password,
    },
  ]

  const usernameRequirementStatuses = [
    { label: 'At least 8 characters', met: username.length >= 8 },
  ]

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    const isFormValid =
      idRequirementStatuses.every((r) => r.met) &&
      usernameRequirementStatuses.every((r) => r.met) &&
      passwordRequirementStatuses.every((r) => r.met) &&
      confirmPasswordRequirementStatuses.every((r) => r.met)

    if (!isFormValid) return

    onSubmitAction?.({ idnumber, password, username })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-lg font-bold text-primary md:text-xl">
          ID number:
        </Label>
        <div className="relative mt-1">
          <CircleUserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={idnumber}
            onChange={(e) => setIdnumber(stripSpaces(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Enter your ID number"
            className="pl-11"
            required
          />
        </div>
        <RequirementList items={idRequirementStatuses} />
      </div>

      <div>
        <Label className="text-lg font-bold text-primary md:text-xl">
          Password:
        </Label>
        <div className="relative mt-1">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
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
        <RequirementList items={passwordRequirementStatuses} />
      </div>

      <div>
        <Label className="text-lg font-bold text-primary md:text-xl">
          Verify password:
        </Label>
        <div className="relative mt-1">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
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
        <RequirementList items={confirmPasswordRequirementStatuses} />
      </div>

      <div>
        <Label className="text-lg font-bold text-primary md:text-xl">
          Username:
        </Label>
        <div className="relative mt-1">
          <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(stripSpaces(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Enter your username"
            className="pl-11"
            required
          />
        </div>
        <RequirementList items={usernameRequirementStatuses} />
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full gap-2">
          <User className="h-5 w-5" />
          Create account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </form>
  )
}
