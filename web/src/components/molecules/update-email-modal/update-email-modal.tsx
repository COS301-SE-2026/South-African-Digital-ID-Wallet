'use client'

import axios from 'axios'
import { useState, useEffect, FC, SubmitEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

import { Text, Button } from '@/components/atoms'
import { TextField } from '@/components/molecules/text-field'
import { manageUserAccountService } from '@/services/manage-user-account-service'

import { UpdateEmailModalProps, Step } from './types'
import { useUser } from '@/context/user-context'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallback
  }
  if (error.response?.status === 429) {
    return 'Too many attempts. Please wait a minute and try again.'
  }
  const data = error.response?.data as
    | { error?: string; detail?: string }
    | undefined
  return data?.error ?? data?.detail ?? fallback
}

const isReauthRequired = (error: unknown): boolean =>
  axios.isAxiosError(error) &&
  (error.response?.data as { code?: string } | undefined)?.code ===
    'REAUTH_REQUIRED'

export const UpdateEmailModal: FC<UpdateEmailModalProps> = ({
  open,
  onCloseAction,
}) => {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (cooldown <= 0) {
      return
    }
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleClose = () => {
    setStep('password')
    setPassword('')
    setEmail('')
    setOTP('')
    setCooldown(0)
    setErrorMessage('')
    onCloseAction()
  }

  const verifyPasswordMutation = useMutation({
    mutationFn: () => manageUserAccountService.verifyPassword(password),
    onSuccess: () => {
      setErrorMessage('')
      setStep('email')
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, 'Incorrect password.'))
    },
  })

  const requestChangeMutation = useMutation({
    mutationFn: () => manageUserAccountService.requestEmailChange(email),
    onSuccess: () => {
      toast.success(`Verification code sent to ${email}`)
      setErrorMessage('')
      setCooldown(60)
      setStep('otp')
    },
    onError: (error) => {
      if (isReauthRequired(error)) {
        setPassword('')
        setStep('password')
        setErrorMessage('Please re-enter your password to continue.')
        return
      }
      setErrorMessage(
        getErrorMessage(error, 'Could not start the email change.')
      )
    },
  })

  const { refresh } = useUser()

  const confirmMutation = useMutation({
    mutationFn: () => manageUserAccountService.confirmEmailChange(otp),
    onSuccess: (account) => {
      queryClient.setQueryData(['manageUserAccount', 'me'], account)
      queryClient.invalidateQueries({ queryKey: ['manageUserAccount', 'me'] })
      void refresh()
      toast.success('Email updated')
      handleClose()
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error, 'Could not confirm the code.'))
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => manageUserAccountService.resendEmailChangeOtp(),
    onSuccess: () => {
      toast.success(`A new code has been sent to ${email}.`)
      setOTP('')
      setErrorMessage('')
      setCooldown(60)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Could not resend the code.'))
    },
  })

  if (!open) {
    return null
  }

  const handlePasswordSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (verifyPasswordMutation.isPending) return
    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }
    setErrorMessage('')
    verifyPasswordMutation.mutate()
  }

  const handleEmailSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (requestChangeMutation.isPending) return
    if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    setErrorMessage('')
    requestChangeMutation.mutate()
  }

  const handleOtpSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (confirmMutation.isPending) return
    if (otp.length !== 6) {
      setErrorMessage('Enter the 6-digit code.')
      return
    }
    setErrorMessage('')
    confirmMutation.mutate()
  }

  const handleResend = () => {
    if (cooldown > 0 || resendMutation.isPending) {
      return
    }
    resendMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative w-[min(560px,95%)] mx-auto">
        <div className="bg-card rounded-3xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <Text as="h2" variant="h3">
              Update Email
            </Text>
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="text-muted-text"
            >
              x
            </button>
          </div>

          {step === 'password' && (
            <>
              <Text as="p" variant="sub-sm" className="mt-2">
                For your security, confirm your password before changing your
                email address.
              </Text>
              <form
                onSubmit={handlePasswordSubmit}
                className="mt-5 flex flex-col gap-5"
              >
                <TextField
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  placeholder=""
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrorMessage('')
                  }}
                  error={errorMessage}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full lg:w-full"
                  isLoading={verifyPasswordMutation.isPending}
                >
                  Continue
                </Button>
              </form>
            </>
          )}

          {step === 'email' && (
            <>
              <Text as="p" variant="sub-sm" className="mt-2">
                Enter your new email address. We&apos;ll send a verification
                code to it.
              </Text>
              <form
                onSubmit={handleEmailSubmit}
                className="mt-5 flex flex-col gap-5"
              >
                <TextField
                  label="New email address"
                  type="email"
                  autoComplete="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrorMessage('')
                  }}
                  error={errorMessage}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full lg:w-full"
                  isLoading={requestChangeMutation.isPending}
                >
                  Send verification code
                </Button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <Text as="p" variant="sub-sm" className="mt-2">
                Enter the 6-digit code sent to {email} to confirm the change.
                The code expires in 10 minutes.
              </Text>
              <form
                onSubmit={handleOtpSubmit}
                className="mt-5 flex flex-col gap-5"
              >
                <TextField
                  label="Verification code"
                  value={otp}
                  onChange={(e) => {
                    setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))
                    setErrorMessage('')
                  }}
                  placeholder=""
                  inputMode="numeric"
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em]"
                  error={errorMessage}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full lg:w-full"
                  isLoading={confirmMutation.isPending}
                >
                  Confirm &amp; Update Email
                </Button>
                <Text variant="sub-sm" className="text-center">
                  Didn&apos;t get a code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || resendMutation.isPending}
                    className="font-semibold text-primary-green hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                </Text>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
