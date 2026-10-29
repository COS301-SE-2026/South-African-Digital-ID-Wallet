'use client'

import * as React from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/atoms'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'
import { loginService } from '@/services'
import axios from 'axios'

type OtpModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (otp: string) => Promise<void>
  deviceVerificationId?: string
}

const OTP_LENGTH = 6

export function OtpModal({
  open,
  onClose,
  onSuccess,
  deviceVerificationId,
}: Readonly<OtpModalProps>) {
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isResending, setIsResending] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const otpCode = otp.join('')

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '')

    if (!digit) return

    const updated = [...otp]
    updated[index] = digit[0]

    setOtp(updated)

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      const updated = [...otp]

      if (otp[index]) {
        updated[index] = ''
        setOtp(updated)
        return
      }

      if (index > 0) {
        updated[index - 1] = ''
        setOtp(updated)

        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!digits) return

    const start = digits.length >= OTP_LENGTH ? 0 : index
    const updated = [...otp]
    digits
      .slice(0, OTP_LENGTH - start)
      .split('')
      .forEach((digit, i) => {
        updated[start + i] = digit
      })
    setOtp(updated)

    const nextIndex = Math.min(start + digits.length, OTP_LENGTH - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void handleVerify()
  }

  const handleVerify = async () => {
    // A fast double Enter would otherwise send the same code twice
    if (isVerifying) return

    if (otpCode.length !== OTP_LENGTH) {
      toast.error('Please enter the 6-digit verification code.')
      return
    }

    setIsVerifying(true)
    try {
      await onSuccess(otpCode)
    } catch {
      toast.error('Invalid verification code.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!deviceVerificationId) {
      toast.error('Device verification ID is missing.')
      return
    }

    setIsResending(true)
    try {
      await loginService.resendDeviceVerificationOtp(deviceVerificationId)
      toast.success('A new verification code has been sent.')
    } catch (error) {
      console.error('Resend device verification error:', error)

      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status)
        console.error('Response:', error.response?.data)

        const message =
          error.response?.data?.error ?? 'Could not resend verification code.'

        toast.error(message)
        return
      }

      toast.error('Could not resend verification code.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <DashboardModal open={open} onClose={onClose} title="Verify New Device">
      {/* A form so pressing Enter in any box submits */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-green/10">
            <ShieldCheck className="h-8 w-8 text-primary-green" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold text-primary-green">
            New Device Detected
          </h3>

          <p className="text-sm text-muted-text">
            Enter the 6-digit verification code sent to your email.
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              value={digit}
              maxLength={1}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)} // spreads a pasted code across the boxes
              className="
                h-12
                w-10
                sm:h-14
                sm:w-12
                rounded-lg
                border
                border-border-grey
                text-center
                text-xl
                font-bold
                outline-none
                focus:border-primary-green
                focus:ring-2
                focus:ring-primary-green/20
              "
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit" // Enter in any box triggers this; no onClick needed
            className="w-40 bg-primary hover:bg-deep-green"
            disabled={isVerifying || otpCode.length !== OTP_LENGTH}
          >
            {isVerifying ? 'Verifying...' : 'Log In'}
          </Button>
        </div>

        <button
          type="button" // keeps Enter from triggering a resend
          onClick={handleResend}
          disabled={isResending}
          className="
            mx-auto
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-primary-green
            hover:text-emerald-700
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`}
          />
          {isResending ? 'Sending...' : 'Resend code'}
        </button>
      </form>
    </DashboardModal>
  )
}
