'use client'

import * as React from 'react'
import Link from 'next/link'
import { KeyRound, Loader2, Mail } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { handleApiError } from '@/lib/exceptionhandler'
import { loginService } from '@/services/login-service'

type Step = 'request' | 'reset'

export const ForgotPasswordForm = () => {
  const router = useRouter()
  // One form, two steps: ask for the email, then take the emailed code and the new password
  const [step, setStep] = React.useState<Step>('request')
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const requestMutation = useMutation({
    mutationFn: () => loginService.forgotPassword(email.trim()),
    onSuccess: () => {
      // Worded so it does not confirm whether the account exists
      toast.success('If that email has an account, a reset code is on its way.')
      setStep('reset')
      setCooldown(60)
    },
    onError: handleApiError,
  })

  const resetMutation = useMutation({
    mutationFn: () =>
      loginService.resetPassword({
        email: email.trim(),
        otp: code,
        newPassword,
        confirmPassword,
      }),
    onSuccess: () => {
      toast.success('Password updated. Please log in.')
      router.push('/login')
    },
    onError: handleApiError,
  })

  const isBusy = requestMutation.isPending || resetMutation.isPending

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step === 'request') {
      requestMutation.mutate()
      return
    }
    // Quick checks here; the backend enforces the full password rules
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    resetMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField
        label="Email:"
        type="email"
        autoComplete="email"
        required
        value={email}
        disabled={step === 'reset'}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      {step === 'reset' && (
        <>
          <TextField
            label="Reset code:"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em]"
          />
          <TextField
            label="New password:"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="At least 10 characters with an uppercase letter, a lowercase letter, a digit and a special character."
          />
          <TextField
            label="Confirm new password:"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </>
      )}

      <Button type="submit" className="w-full gap-2" disabled={isBusy}>
        {isBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : step === 'request' ? (
          <Mail className="h-5 w-5" />
        ) : (
          <KeyRound className="h-5 w-5" />
        )}
        {step === 'request' ? 'Send reset code' : 'Update password'}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {step === 'reset' ? (
          <button
            type="button"
            onClick={() => requestMutation.mutate()}
            disabled={isBusy || cooldown > 0}
            className="font-semibold text-primary-green hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        ) : (
          <span />
        )}
        <Link href="/login" className="text-primary-green hover:underline">
          Back to login
        </Link>
      </div>

      {step === 'reset' && (
        <Text variant="sub-sm" className="text-center">
          Wrong email?{' '}
          <button
            type="button"
            onClick={() => setStep('request')}
            disabled={isBusy}
            className="font-semibold text-primary-green hover:underline"
          >
            Use a different email
          </button>
        </Text>
      )}
    </form>
  )
}
