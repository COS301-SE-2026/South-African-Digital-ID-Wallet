'use client'

import * as React from 'react'
import { Text } from '@/components/atoms'
import { Button } from '@/components/ui/button'
import { QrCameraScanner } from '@/components/organisms/qr-camera-scanner'
import { ScanResultCard } from '@/components/organisms/scan-result-card'
import scanService, { parseScannedToken } from '@/services/scan-service'
import type { ResolveCredentialResponse } from '@/services/scan-service'

type Status = 'scanning' | 'processing' | 'result' | 'error'

export const VerificationPage = () => {
  const [status, setStatus] = React.useState<Status>('scanning')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [result, setResult] = React.useState<ResolveCredentialResponse | null>(
    null
  )

  const handleScan = React.useCallback(async (rawText: string) => {
    setStatus('processing')

    const parsed = parseScannedToken(rawText)

    if (!parsed) {
      setErrorMessage('This is not a valid FlashID QR Code.')
      setStatus('error')
      return
    }

    if (parsed.type === 'badge') {
      setErrorMessage('Scanning official badges is not available yet')
      setStatus('error')
      return
    }

    try {
      const response = await scanService.resolveCred(parsed.token)
      setResult(response)
      setStatus('result')
    } catch {
      setErrorMessage(
        'This QR Code is invalid, expired, or has already been used.'
      )
      setStatus('error')
    }
  }, [])

  const handleScanAgain = () => {
    setResult(null)
    setErrorMessage('')
    setStatus('scanning')
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <Text variant="h3">Scan the QR Code</Text>

      {(status === 'scanning' || status === 'processing') && (
        <>
          <div className="mx-auto aspect-square w-full max-w-sm">
            <QrCameraScanner
              onScan={handleScan}
              paused={status === 'processing'}
            />
          </div>
          {status === 'processing' && (
            <Text variant="sub-md">Checking QR Code...</Text>
          )}
        </>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Text variant="sub-md" className="text-destructive">
            {errorMessage}
          </Text>
          <Button type="button" onClick={handleScanAgain}>
            Scan again
          </Button>
        </div>
      )}

      {status === 'result' && result && (
        <div className="flex flex-col gap-4">
          <ScanResultCard
            credentialType={result.credentialType}
            disclosedFields={result.disclosedFields}
          />
          <Button type="button" onClick={handleScanAgain}>
            Scan another code
          </Button>
        </div>
      )}
    </div>
  )
}
