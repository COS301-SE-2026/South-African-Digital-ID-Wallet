'use client'

import { useState, useEffect, FC, SubmitEvent } from 'react'
import { toast } from 'react-hot-toast'

import { Text, Button } from '@/components/atoms'
import { TextField } from '@/components/molecules'

import { UpdateEmailModalProps } from './types'

export const UpdateEmailModal: FC<UpdateEmailModalProps> = ({
  open,
  onCloseAction,
}) => {
  const [mode, setMode] = useState<'email' | 'otp'>('email')
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

  if (!open) {
    return null
  }

  const handleClose = () => {
    setMode('email')
    setEmail('')
    setOTP('')
    setCooldown(0)
    setErrorMessage('')
    onCloseAction()
  }

  const handleEmailSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    setErrorMessage('')
    //integration here
    toast.success('Verification code sent to your current email')
    setCooldown(60)
    setMode('otp')
  }

  const handleOtpSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setErrorMessage('Enter the 6-digit code.')
      return
    }
    //integration here
    toast.success('Email updated')
    handleClose()
  }

  const handleResend = () => {
    if (cooldown > 0) {
      return
    }
    //integration here
    toast.success('A new code has been sent to your current email.')
    setCooldown(60)
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
              aria-label="Close"
              onClick={handleClose}
              className="text-muted-text"
            >
              x
            </button>
          </div>

          {mode === 'email' ? (
            <>
              <Text as="p" variant="sub-sm" className="mt-2">
                Change the email address associated with your account.
              </Text>
              <form
                onSubmit={handleEmailSubmit}
                className="mt-5 flex flex-col gap-5"
              >
                <TextField
                  label="New email address"
                  type="email"
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
                >
                  Update Email
                </Button>
              </form>
            </>
          ) : (
            <>
              <Text as="p" variant="sub-sm" className="mt-2">
                Enter the 6-digit code sent to your current email to confirm the
                change to {email}.
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
                >
                  Confirm & Update Email
                </Button>
                <Text variant="sub-sm" className="text-center">
                  Didn&apos;t get a code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0}
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
