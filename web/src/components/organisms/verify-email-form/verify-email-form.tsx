'use client'

import * as React from 'react'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'

import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerService } from '@/services/citizen-register-service'

export const VerifyEmailForm = () => {
  const router = useRouter()
  const searchParameters = useSearchParams()
  const email = searchParameters.get('email') ?? ''

  const [code, setCode] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const verifyMutation = useMutation({
    mutationFn: () => registerService.verifyEmail({ email, code }),
    onSuccess: () => {
      toast.success('Email verified. Please log in.')
      router.push('/')
    },
    onError: (err) => {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Verification failed'
      toast.error(message)
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => registerService.resendOtp(email),
    onSuccess: () => {
      toast.success('A new code has been sent to your email.')
      setCooldown(60)
    },
    onError: (err) => {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Could not resend code'
      toast.error(message)
    },
  })

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    verifyMutation.mutate()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col justify-evenly gap-5"
    >
      <div>
        <TextField
          label="Verification code:"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
          className="text-center text-2xl tracking-[0.5em]"
        />
        <Text variant="sub-sm" className="mt-1.5 text-center">
          Code sent to {email || 'your email'}
        </Text>
      </div>

      <div className="space-y-4 pt-1">
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ShieldCheck className="h-5 w-5" />
          )}
          {verifyMutation.isPending ? 'Verifying...' : 'Verify email'}
        </Button>

        <Text variant="sub-sm" className="text-center">
          Didn&apos;t get a code?{' '}
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending || cooldown > 0}
            className="font-semibold text-primary-green hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : `Resend code`}
          </button>
        </Text>
      </div>
    </form>
  )
}
