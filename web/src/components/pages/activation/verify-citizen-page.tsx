'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'

import { Text } from '@/components/atoms'
import { Button } from '@/components/ui/button'
import { VerifyMethod } from '@/components/organisms/verify-method'
import type { VerifyMethodOption } from '@/components/organisms/verify-method'
import { VerifyIdentityCard } from '@/components/organisms/verify-identity-card'
import { verificationService } from '@/services/verification-service'

type Status = 'method' | 'code' | 'physical' | 'success' | 'error'

const FLOW_STEPS = ['Choose Method', 'Verify Identity', 'Complete']

const STEP_BY_STATUS: Record<Status, number> = {
  method: 1,
  code: 2,
  physical: 2,
  success: 3,
  error: 2,
}

type ActivateCitizenPageProps = {
  token?: string
}

type ProblemDetails = {
  title?: string
  detail?: string
}

export const ActivateCitizenPage = ({
  token = '',
}: ActivateCitizenPageProps) => {
  const router = useRouter()

  const [status, setStatus] = React.useState<Status>(token ? 'code' : 'method')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [activationCode, setActivationCode] = React.useState(token)
  const [isActivationCodeDetected, setIsActivationCodeDetected] =
    React.useState(Boolean(token))
  const [saId, setSaId] = React.useState('')
  const [pin, setPin] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSelectMethod = (method: VerifyMethodOption) => {
    setErrorMessage('')

    if (method === 'code') {
      setStatus('code')
      return
    }

    setStatus('physical')
  }

  const handleIdentitySubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await verificationService.verify({
        token: activationCode,
        saId,
        pin,
      })

      if (!response.isVerified) {
        setErrorMessage(
          response.message || 'Your identity could not be verified.'
        )
        return
      }

      setStatus('success')
    } catch (error) {
      const axiosError = error as AxiosError<ProblemDetails>

      setErrorMessage(
        axiosError.response?.data?.detail ??
          'We could not verify your identity. Please check your details and try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnterCodeManually = () => {
    setIsActivationCodeDetected(false)
    setActivationCode('')
  }

  const handleBackToMethods = () => {
    setErrorMessage('')
    setStatus('method')
  }

  const handleActivateCredentials = () => {
    router.push('/citizen/activate-credentials')
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

      {status === 'code' && (
        <div className="w-full max-w-2xl">
          <VerifyIdentityCard
            steps={FLOW_STEPS}
            currentStep={STEP_BY_STATUS.code}
            activationCode={activationCode}
            isActivationCodeDetected={isActivationCodeDetected}
            saId={saId}
            pin={pin}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            submitLabel="Verify Identity"
            onActivationCodeChange={setActivationCode}
            onSaIdChange={setSaId}
            onPinChange={setPin}
            onSubmit={handleIdentitySubmit}
            onBack={handleBackToMethods}
            onEnterCodeManually={
              isActivationCodeDetected ? handleEnterCodeManually : undefined
            }
          />
        </div>
      )}

      {status === 'physical' && (
        <div className="w-full max-w-2xl rounded-3xl border border-border/70 bg-white p-8 shadow-xl shadow-deep-green/10">
          <div className="text-center">
            <Text variant="h3">Verify your identity</Text>

            <Text variant="sub-md" className="mt-2 text-muted-foreground">
              Verify your South African identity using facial verification.
            </Text>
          </div>

          <div className="mt-8 rounded-2xl bg-muted/40 p-6 text-center">
            <Text variant="sub-md" className="font-semibold">
              Physical identity verification
            </Text>

            <Text variant="sub-sm" className="mt-2 text-muted-foreground">
              Continue with your South African ID number and facial
              verification.
            </Text>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToMethods}
            >
              Back
            </Button>

            <Button type="button" className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-white p-8 text-center shadow-xl shadow-deep-green/10">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary-green/10">
            <div className="size-4 rounded-full bg-primary-green" />
          </div>

          <Text variant="h3">Identity verified</Text>

          <Text variant="sub-md" className="mt-3 text-muted-foreground">
            Your identity has been verified successfully. You can now activate
            your digital credentials.
          </Text>

          <Button
            type="button"
            className="mt-8 w-full"
            onClick={handleActivateCredentials}
          >
            Activate My Credentials
          </Button>
        </div>
      )}
    </div>
  )
}
