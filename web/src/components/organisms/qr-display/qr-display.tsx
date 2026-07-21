'use client'

import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text, StatusPill } from '@/components/atoms'
import { qrService } from '@/services/qr-service'
import type { QrDisplayProps } from './types'

const WARNING_THRESHOLD_SECONDS = 15

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

type Status = 'loading' | 'ready' | 'error'

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

  const fetchQr = React.useCallback(async () => {
    try {
      const disclosedFields = [...mandatoryFields, ...selectedOptionalFields]
      const response = await qrService.generate(credentialId, disclosedFields)
      const expiresAt = new Date(response.expiresAt).getTime()
      setQrValue(response.token)
      setExpiresAtMs(expiresAt)
      setSecondsRemaining(
        Math.max(Math.round((expiresAt - Date.now()) / 1000), 0)
      )
      hasShownWarningToast.current = false
      setStatus('ready')
    } catch {
      setErrorMessage('Could not generate your QR code. Please try again.')
      setStatus('error')
    }
  }, [credentialId, mandatoryFields, selectedOptionalFields])

  const handleRetry = () => {
    setStatus('loading')
    setErrorMessage('')
    fetchQr()
  }

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQr()
  }, [fetchQr])

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
    <div className="flex flex-col items-center gap-6">
      <Card className="flex w-72 flex-col items-center gap-4 p-8">
        {isExpired ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Text variant="sub-lg">QR code expired</Text>
            <Text variant="sub-sm" className="text-muted-foreground">
              Generate a new code to continue verification.
            </Text>
            <Button type="button" onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Generate new QR
            </Button>
          </div>
        ) : (
          <QRCodeSVG value={qrValue} size={200} />
        )}

        <div className="flex flex-col items-center gap-1">
          {isExpired ? (
            <StatusPill intent="inactive">Expired</StatusPill>
          ) : (
            <StatusPill intent="active">Valid credential</StatusPill>
          )}
          {!isExpired && (
            <Text
              variant="sub-lg"
              className={isWarning ? 'font-bold text-destructive' : 'font-bold'}
            >
              {formatTime(secondsRemaining)}
            </Text>
          )}
        </div>
      </Card>

      <Button type="button" variant="secondary" onClick={onBack}>
        Back to preview
      </Button>
    </div>
  )
}
