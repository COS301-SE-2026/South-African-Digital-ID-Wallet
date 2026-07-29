'use client'

import * as React from 'react'
import Link from 'next/link'
import { User, CircleUserRound, LockKeyhole, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms'
import { getSafeReturnTo, TextField } from '@/components/molecules'
import type { RegistrationFormProps } from '@/types/registration-form.types'

import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerService } from '@/services/citizen-register-service'

const RequirementList = ({
  items,
  show,
}: {
  items: { label: string; met: boolean }[]
  show: boolean
}) => {
  const allMet = items.every((item) => item.met)
  const shouldShow = show && !allMet

  if (!shouldShow) return null

  return (
    <div className="mt-1.5 flex flex-col gap-1" aria-live="polite">
      {items.map((item) => (
        <p
          key={item.label}
          className={`text-xs leading-snug ${
            item.met ? 'text-muted-foreground line-through' : 'text-destructive'
          }`}
        >
          {item.label}
        </p>
      ))}
    </div>
  )
}

export const RegistrationForm = ({
  onSubmitAction,
}: Readonly<RegistrationFormProps>) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [submitted, setSubmitted] = React.useState(false)
  const [dirtyFields, setDirtyFields] = React.useState<Set<string>>(new Set())

  const stripSpaces = (value: string) => value.replace(/\s+/g, '')

  const markDirty = (field: string) =>
    setDirtyFields((prev) => new Set(prev).add(field))

  const showErrors = (field: string) => submitted && !dirtyFields.has(field)

  const isValidEmail = (value: string) => {
    const email = value.trim()

    if (!email) return false
    if (/\s/.test(email)) return false

    return /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/.test(
      email
    )
  }

  const emailRequirements = [
    { label: 'Must be a valid email address', met: isValidEmail(email) },
  ]

  const passwordRequirements = [
    { label: 'Must be at least 10 characters', met: password.length >= 10 },
    {
      label: 'Must contain at least 1 capital letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Must contain at least 1 digit (0-9)',
      met: /\d/.test(password),
    },
    {
      label: 'Must contain at least 1 lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Must conatain at least 1 special character (!@#$%^&*)',
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
    emailRequirements.every((r) => r.met) &&
    passwordRequirements.every((r) => r.met) &&
    confirmRequirements.every((r) => r.met)

  const router = useRouter()

  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const safeReturnTo = getSafeReturnTo(returnTo, '')

  const loginHref = safeReturnTo
    ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}`
    : `/login`

  const registerMutation = useMutation({
    mutationFn: registerService.register,
    onSuccess: () => {
      toast.success(
        'Account created successfully. Please check your email to verify your account.'
      )

      const verifyEmailHref = safeReturnTo
        ? `/verify-email?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(safeReturnTo)}`
        : `/verify-email?email=${encodeURIComponent(email)}`

      router.push(verifyEmailHref)
    },
    onError: (err) => {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Registration failed. Please try again.'
      toast.error(message)
    },
  })

  const handleSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (
    e
  ) => {
    e.preventDefault()
    setSubmitted(true)
    setDirtyFields(new Set())
    if (!isFormValid) return
    onSubmitAction?.({
      email,
      password,
    })
    registerMutation.mutate({
      email,
      password,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex h-full flex-col justify-evenly gap-5"
    >
      {/* Email */}
      <div>
        <div className="relative">
          <CircleUserRound className="pointer-events-non absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="Email:"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(stripSpaces(e.target.value))
              markDirty('email')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Enter your email address"
            className="pl-11"
          />
        </div>
        <RequirementList items={emailRequirements} show={showErrors('email')} />
      </div>

      {/* Password */}
      <div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="Password:"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(stripSpaces(e.target.value))
              markDirty('password')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Enter your password"
            className="pl-11"
          />
        </div>
        <RequirementList
          items={passwordRequirements}
          show={showErrors('password')}
        />
      </div>

      {/* Verify Password */}
      <div className="relative">
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-[54px] h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <TextField
            label="Verify password:"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(stripSpaces(e.target.value))
              markDirty('confirmPassword')
            }}
            onKeyDown={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            placeholder="Re-enter your password"
            className="pl-11"
          />
        </div>
        <RequirementList
          items={confirmRequirements}
          show={showErrors('confirmPassword')}
        />
      </div>

      {/* Submit */}
      <div className="space-y-4 pt-1">
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <User className="h-5 w-5" />
          )}
          {registerMutation.isPending
            ? 'Creating account...'
            : 'Create account'}
        </Button>
        <Text variant="sub-sm" className="text-center">
          Already have an account?{' '}
          <Link
            href={loginHref}
            className="font-semibold text-primary-green hover:underline"
          >
            Log in
          </Link>
        </Text>
      </div>
    </form>
  )
}
