'use client'

import * as React from 'react'
import Link from 'next/link'
import { User, CircleUserRound, LockKeyhole, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import type {
  RegistrationFormProps,
  VerificationMethod,
} from '@/types/registration-form.types'

const RequirementList = ({
  items,
}: {
  items: { label: string; met: boolean }[]
}) => (
  <div className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-0.5">
    {items.map((item) => (
      <p
        key={item.label}
        className={`text-xs leading-snug ${item.met ? 'text-success-green' : 'text-muted-foreground'}`}
      >
        • {item.label}
      </p>
    ))}
  </div>
)

export const RegistrationForm = ({
  onSubmitAction,
}: Readonly<RegistrationFormProps>) => {
  const [idnumber, setIdnumber] = React.useState('')
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [verificationMethod, setVerificationMethod] =
    React.useState<VerificationMethod>('activation')
  const [activationCode, setActivationCode] = React.useState('')

  const stripSpaces = (value: string) => value.replace(/\s+/g, '')

  const idRequirements = [
    { label: 'Exactly 13 digits', met: idnumber.length === 13 },
  ]

  const usernameRequirements = [
    { label: 'At least 8 characters', met: username.length >= 8 },
  ]

  const passwordRequirements = [
    { label: 'At least 10 characters', met: password.length >= 10 },
    { label: 'One capital letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'One digit (0-9)', met: /[0-9]/.test(password) },
    {
      label: 'One special character (!@#$%^&*)',
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
    confirmRequirements.every((r) => r.met) &&
    (verificationMethod === 'physical' || activationCode.trim().length > 0)

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    if (!isFormValid) return
    onSubmitAction?.({
      idnumber,
      username,
      password,
      activationCode,
      verificationMethod,
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
        <RequirementList items={idRequirements} />
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
        <RequirementList items={usernameRequirements} />
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
        <RequirementList items={passwordRequirements} />
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
        <RequirementList items={confirmRequirements} />
      </div>

      {/* Verification Method */}
      <div>
        <Text variant="label" as="label">
          Verification method:
        </Text>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={
              verificationMethod === 'activation' ? 'default' : 'outline'
            }
            onClick={() => setVerificationMethod('activation')}
            className="w-full"
          >
            Activation Code
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            className="w-full cursor-not-allowed opacity-50"
            title="Physical verification is not yet available"
          >
            Physical Verification
            <Badge variant="secondary" className="ml-2 text-[10px]">
              Soon
            </Badge>
          </Button>
        </div>

        {verificationMethod === 'activation' && (
          <div className="relative mt-3">
            <KeyRound className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <TextField
              label="Activation code:"
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.trim())}
              placeholder="Enter your activation code"
              className="pl-11"
              helperText="Enter the activation code sent to you by your Home Affairs official."
              required
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="space-y-4 pt-1">
        <Button type="submit" className="w-full gap-2" disabled={!isFormValid}>
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
