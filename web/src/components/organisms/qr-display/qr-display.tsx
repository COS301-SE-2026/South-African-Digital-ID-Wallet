'use client'

import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { qrService } from '@/services/qr-service'
import type { Status, QrDisplayProps } from './types'

const WARNING_THRESHOLD_SECONDS = 15

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const QrDisplay = ({ selection, onBack }: Readonly<QrDisplayProps>) => {
  const { credentialId, mandatoryFields, selectedOptionalFields } = selection

  const [status, setStatus] = React.useState<Status>('loading')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [qrValue, setQrValue] = React.useState('')
  const [secondsRemaining, setSecondsRemaining] = React.useState(0)
  const [expiresAtMs, setExpiresAtMs] = React.useState<number | null>(null)
  const hasShownWarningToast = React.useRef(false)

  const isExpired = status === 'ready' && secondsRemaining <= 0
  const isWarning =
    status === 'ready' &&
    secondsRemaining <= WARNING_THRESHOLD_SECONDS &&
    !isExpired

  const [retryToken, setRetryToken] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const disclosedFields = [...mandatoryFields, ...selectedOptionalFields]
        const response = await qrService.generate(credentialId, disclosedFields)
        if (cancelled) return
        const expiresAt = new Date(response.expiresAt).getTime()
        setQrValue(response.token)
        setExpiresAtMs(expiresAt)
        setSecondsRemaining(
          Math.max(Math.round((expiresAt - Date.now()) / 1000), 0)
        )
        hasShownWarningToast.current = false
        setStatus('ready')
      } catch {
        if (!cancelled) {
          setErrorMessage('Could not generate your QR code. Please try again.')
          setStatus('error')
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [credentialId, mandatoryFields, selectedOptionalFields, retryToken])

  const handleRetry = () => {
    setStatus('loading')
    setErrorMessage('')
    setRetryToken((t) => t + 1)
  }

  React.useEffect(() => {
    if (status !== 'ready' || isExpired || expiresAtMs === null) return
    const interval = setInterval(() => {
      setSecondsRemaining(
        Math.max(Math.round((expiresAtMs - Date.now()) / 1000), 0)
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [status, isExpired, expiresAtMs])

  React.useEffect(() => {
    if (isWarning && !hasShownWarningToast.current) {
      hasShownWarningToast.current = true
      toast.error('15 seconds left - your QR code is about to expire')
    }
  }, [isWarning])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Text variant="sub-md">Generating your QR code...</Text>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <Text variant="sub-lg">Something went wrong</Text>
        <Text variant="sub-sm" className="text-muted-foreground">
          {errorMessage}
        </Text>
        <Button type="button" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </Card>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center  px-6 py-12">
      <Card className="w-full max-w-3xl rounded-[32px] border border-gray-200 bg-white p-10 shadow-2xl">
        <div className=" text-center">
          <Text variant="h2">Your QR Code</Text>

          <Text variant="sub-md" className="mt-1">
            Share your identity securely
          </Text>
        </div>

        <div className="flex justify-center">
          <div className="relative p-6">
            <div className="absolute left-3 top-3 h-8 w-8 border-l-4 border-t-4 border-emerald-600" />
            <div className="absolute right-3 top-3 h-8 w-8 border-r-4 border-t-4 border-amber-500" />
            <div className="absolute bottom-3 left-3 h-8 w-8 border-b-4 border-l-4 border-red-500" />
            <div className="absolute bottom-3 right-3 h-8 w-8 border-b-4 border-r-4 border-blue-600" />
            <QRCodeSVG value={qrValue} size={300} includeMargin />
          </div>
        </div>

        <div className=" flex items-center justify-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${isWarning ? 'bg-red-500' : 'bg-emerald-500'}`}
          />

          <Text
            variant="sub-md"
            className={
              isWarning
                ? 'font-semibold text-red-600'
                : 'font-semibold text-emerald-700'
            }
          >
            Valid for {formatTime(secondsRemaining)}
          </Text>
        </div>

        <Button
          type="button"
          onClick={handleRetry}
          className="mt-1 h-12 w-full rounded-2xl bg-primary-green text-white hover:bg-amber-600"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh QR Code
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className=" h-12 w-full rounded-2xl"
        >
          Back
        </Button>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <Text variant="sub-sm" className="text-gray-500">
            Secure • Signed • Controlled by You
          </Text>
        </div>
      </Card>
    </div>
  )
}
