'use client'
import * as React from 'react'
import { Text } from '@/components/atoms'
import { Button } from '@/components/ui/button'
import { QrCameraScanner } from '@/components/organisms/qr-camera-scanner'
import { ScanResultCard } from '@/components/organisms/scan-result-card'
import { VerifyMethod } from '@/components/organisms/verify-method'
import type { VerifyMethodOption } from '@/components/organisms/verify-method'
import { VerifyIdentityCard } from '@/components/organisms/verify-identity-card/verify-identity-card'
import scanService, { parseScannedToken } from '@/services/scan-service'
import type { ResolveCredentialResponse } from '@/services/scan-service'

type Status = 'method' | 'scanning' | 'processing' | 'result' | 'error'

const FLOW_STEPS = ['Choose Method', 'Verify Identity', 'Complete']
const STEP_BY_STATUS: Record<Status, number> = {
  method: 1,
  scanning: 2,
  processing: 2,
  result: 3,
  error: 2,
}

type ActivateCitizenPageProps = {
  token?: string
}

export const ActivateCitizenPage = ({
  token = '',
}: ActivateCitizenPageProps) => {
  const [status, setStatus] = React.useState<Status>('method')
  const [isCodeModalOpen, setIsCodeModalOpen] = React.useState(Boolean(token))
  const [errorMessage, setErrorMessage] = React.useState('')
  const [result, setResult] = React.useState<ResolveCredentialResponse | null>(
    null
  )
  const [activationCode, setActivationCode] = React.useState(token)
  const [isActivationCodeDetected, setIsActivationCodeDetected] =
    React.useState(Boolean(token))
  const [saId, setSaId] = React.useState('')
  const [pin, setPin] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSelectMethod = (method: VerifyMethodOption) => {
    if (method === 'code') {
      setIsCodeModalOpen(true)
      return
    }
    setStatus('scanning')
  }

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
    setStatus('method')
  }

  const handleIdentitySubmit = () => {
    setIsSubmitting(true)
    console.log('Submitting identity verification', {
      activationCode,
      saId,
      pin,
    })
    setTimeout(() => {
      setIsSubmitting(false)
      setIsCodeModalOpen(false)
    }, 1500)
  }

  const handleEnterCodeManually = () => {
    setIsActivationCodeDetected(false)
    setActivationCode('')
  }

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
      {status === 'method' && (
        <div className="w-full max-w-2xl">
          <VerifyMethod
            steps={FLOW_STEPS}
            currentStep={STEP_BY_STATUS.method}
            onSelectMethod={handleSelectMethod}
          />
        </div>
      )}
      <VerifyIdentityCard
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        steps={FLOW_STEPS}
        currentStep={2}
        activationCode={activationCode}
        isActivationCodeDetected={isActivationCodeDetected}
        saId={saId}
        pin={pin}
        isSubmitting={isSubmitting}
        submitLabel="Verify Identity"
        onActivationCodeChange={setActivationCode}
        onSaIdChange={setSaId}
        onPinChange={setPin}
        onSubmit={handleIdentitySubmit}
        onEnterCodeManually={
          isActivationCodeDetected ? handleEnterCodeManually : undefined
        }
      />
      {(status === 'scanning' || status === 'processing') && (
        <div className="w-full">
          <QrCameraScanner
            onScan={handleScan}
            paused={status === 'processing'}
          />
        </div>
      )}
      {status === 'error' && (
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </div>
          <Text variant="h3">Verification failed</Text>
          <Text variant="sub-md" className="mt-2 text-muted-foreground">
            {errorMessage}
          </Text>
          <Button
            type="button"
            onClick={handleScanAgain}
            className="mt-6 w-full"
          >
            Scan again
          </Button>
        </div>
      )}
      {status === 'result' && result && (
        <div className="w-full max-w-md">
          <ScanResultCard
            credentialType={result.credentialType}
            disclosedFields={result.disclosedFields}
          />
          <Button
            type="button"
            onClick={handleScanAgain}
            className="mt-5 w-full"
          >
            Scan another code
          </Button>
        </div>
      )}
    </div>
  )
}
