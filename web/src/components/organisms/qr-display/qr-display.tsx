'use client'
import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { qrService } from '@/services/qr-service'
import type { QrDisplayProps } from './types'

const WARNING_THRESHOLD_SECONDS = 15

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type Status = 'loading' | 'ready' | 'error'

export const QrDisplay = ({
  selection,
  onBack,
  embedded = false,
  compact = false,
  showBackButton = false,
}: Readonly<QrDisplayProps>) => {
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
      <div
        className={
          embedded
            ? 'flex flex-col items-center gap-3 py-4'
            : 'flex min-h-screen items-center justify-center px-6 py-12'
        }
      >
        <Card
          className={
            embedded
              ? 'w-full rounded-[28px] border border-border-grey bg-card p-4 shadow-none sm:p-6'
              : 'w-full max-w-3xl rounded-[32px] border border-gray-200 bg-white p-10 shadow-2xl'
          }
        >
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Text variant="sub-md">Generating your QR code...</Text>
          </div>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Card
        className={
          embedded
            ? 'flex flex-col items-center gap-4 rounded-[28px] border border-border-grey bg-card p-4 text-center shadow-none sm:p-6'
            : 'flex flex-col items-center gap-4 p-6 text-center'
        }
      >
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
    <div
      className={
        embedded
          ? 'flex h-full flex-col'
          : 'flex min-h-screen items-center justify-center px-6 py-12'
      }
    >
      <Card
        className={
          embedded
            ? 'flex h-full w-full flex-col rounded-[28px] border border-border-grey bg-card p-4 shadow-none sm:p-6'
            : 'w-full max-w-3xl rounded-[32px] border border-gray-200 bg-white p-10 shadow-2xl'
        }
      >
        <div className="shrink-0 text-center">
          <Text variant="h2">QR Preview</Text>

          <Text variant="sub-md" className="mt-1 pb-4">
            Share your identity securely
          </Text>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center py-6 sm:py-8">
          <div className={compact ? 'relative p-3 sm:p-4' : 'relative p-6'}>
            <div className="absolute left-3 top-3 h-8 w-8 border-l-4 border-t-4 border-emerald-600" />
            <div className="absolute right-3 top-3 h-8 w-8 border-r-4 border-t-4 border-amber-500" />
            <div className="absolute bottom-3 left-3 h-8 w-8 border-b-4 border-l-4 border-red-500" />
            <div className="absolute bottom-3 right-3 h-8 w-8 border-b-4 border-r-4 border-blue-600" />

            <QRCodeSVG
              value={qrValue}
              size={compact ? 280 : 320}
              includeMargin
            />
          </div>
        </div>

        <div className="shrink-0">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isWarning ? 'bg-red-500' : 'bg-emerald-500'
              }`}
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
        </div>

        <div className="mt-5 flex shrink-0 items-center justify-center gap-3">
          <Button
            type="button"
            onClick={handleRetry}
            className="h-11 rounded-xl bg-primary-green px-5 text-white hover:bg-amber-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh QR
          </Button>

          {showBackButton && (
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              className="h-11 rounded-xl px-5"
            >
              Back
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
