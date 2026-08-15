'use client'

import * as React from 'react'
import toast from 'react-hot-toast'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/atoms'
import { DashboardModal } from '@/components/molecules/dashboard-modal/dashboard-modal'

type OtpModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (otp: string) => Promise<void>
}

const OTP_LENGTH = 6

export function OtpModal({
  open,
  onClose,
  onSuccess,
}: Readonly<OtpModalProps>) {
  const [otp, setOtp] = React.useState<string[]>(Array(OTP_LENGTH).fill(''))

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

  const handleVerify = async () => {
    if (otpCode.length !== OTP_LENGTH) {
      toast.error('Please enter the 6-digit verification code.')
      return
    }

    try {
      await onSuccess(otpCode)
    } catch {
      toast.error('Invalid verification code.')
    }
  }

  const handleResend = async () => {
    try {
      toast.success('A new verification code has been sent.')
    } catch {
      toast.error('Could not resend verification code.')
    }
  }

  return (
    <DashboardModal open={open} onClose={onClose} title="Verify New Device">
      <div className="space-y-6">
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

        <div className="flex justify-center gap-3">
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
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="
                h-14
                w-12
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
            className="w-40"
            onClick={handleVerify}
            disabled={otpCode.length !== OTP_LENGTH}
          >
            Log In
          </Button>
        </div>

        <button
          type="button"
          onClick={handleResend}
          className="
            mx-auto
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-primary-green
            hover:text-emerald-700
          "
        >
          <RefreshCw className="h-4 w-4" />
          Resend code
        </button>
      </div>
    </DashboardModal>
  )
}
