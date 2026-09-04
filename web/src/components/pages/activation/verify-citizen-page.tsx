'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { AxiosError } from 'axios'
import { ReadyToVerify } from '@/components/organisms/ready-to-verify'
import { VerifyMethod } from '@/components/organisms/verify-method'

import {
  LivenessCameraDialog,
  PhysicalIdentityForm,
  VerificationFailure,
  VerifyIdentityCard,
} from '@/components/organisms'

import { ConsentToVerify } from '@/components/organisms/consent-to-verify'

import type { VerifyMethodOption } from '@/components/organisms/verify-method'

import { VerificationSuccessModal } from '@/components/molecules'

import {
  verificationService,
  type IdentityVerificationStatus,
} from '@/services/verification-service'

const FLOW_STEPS = ['Choose Method', 'Verify Identity', 'Complete']

type VerificationView =
  | 'method'
  | 'activation-code'
  | 'physical-id'
  | 'processing'
  | 'failure'

type VerifyCitizenPageProps = {
  token?: string
}

type ProblemDetails = {
  title?: string
  detail?: string
  message?: string
}

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ProblemDetails>

  return (
    axiosError.response?.data?.detail ??
    axiosError.response?.data?.message ??
    axiosError.response?.data?.title ??
    (error instanceof Error ? error.message : fallback)
  )
}

export const VerifyCitizenPage = ({ token = '' }: VerifyCitizenPageProps) => {
  const router = useRouter()

  const [view, setView] = React.useState<VerificationView>(
    token ? 'activation-code' : 'method'
  )

  const [errorMessage, setErrorMessage] = React.useState('')

  const [activationCode, setActivationCode] = React.useState(token)

  const [isActivationCodeDetected, setIsActivationCodeDetected] =
    React.useState(Boolean(token))

  const [saId, setSaId] = React.useState('')

  const [pin, setPin] = React.useState('')

  const [physicalSaId, setPhysicalSaId] = React.useState('')

  const [verificationId, setVerificationId] = React.useState('')

  const [authToken, setAuthToken] = React.useState('')

  const [consentOpen, setConsentOpen] = React.useState(false)

  const [readyOpen, setReadyOpen] = React.useState(false)

  const [cameraOpen, setCameraOpen] = React.useState(false)

  const [successOpen, setSuccessOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [isPreparingCamera, setIsPreparingCamera] = React.useState(false)

  const clearError = () => {
    setErrorMessage('')
  }

  const showSuccess = () => {
    clearError()
    setSuccessOpen(true)
  }

  const resetPhysicalFlow = () => {
    setPhysicalSaId('')
    setVerificationId('')
    setAuthToken('')
    setConsentOpen(false)
    setReadyOpen(false)
    setCameraOpen(false)
  }

  const handleSelectMethod = (method: VerifyMethodOption) => {
    clearError()

    if (method === 'code') {
      setView('activation-code')
      return
    }

    setView('physical-id')
  }

  const handleActivationCodeVerification = async () => {
    setIsSubmitting(true)
    clearError()

    try {
      const result = await verificationService.verify({
        token: activationCode,
        saId,
        pin,
      })

      if (!result.isVerified) {
        setErrorMessage(
          result.message || 'Your identity could not be verified.'
        )

        return
      }

      showSuccess()
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          'We could not verify your identity. Please check your details and try again.'
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhysicalIdContinue = () => {
    clearError()

    if (physicalSaId.length !== 13) {
      setErrorMessage('Please enter a valid 13-digit South African ID number.')

      return
    }

    setConsentOpen(true)
  }

  const handlePhysicalConsent = async () => {
    setIsSubmitting(true)
    clearError()

    try {
      const started = await verificationService.startPhysicalVerification()

      setVerificationId(started.verificationId)

      if (started.status === 'Verified') {
        setConsentOpen(false)
        showSuccess()
        return
      }

      if (started.status === 'Failed' || started.status === 'Expired') {
        setConsentOpen(false)
        setView('failure')

        setErrorMessage(
          started.status === 'Expired'
            ? 'This verification session has expired.'
            : 'This verification session has already failed.'
        )

        return
      }

      let currentStatus: IdentityVerificationStatus = started.status

      if (currentStatus === 'AwaitingConsent') {
        const consentResult = await verificationService.grantPhysicalConsent(
          started.verificationId
        )

        currentStatus = consentResult.status
      }

      if (currentStatus === 'Verified') {
        setConsentOpen(false)
        showSuccess()
        return
      }

      if (currentStatus === 'Failed' || currentStatus === 'Expired') {
        setConsentOpen(false)
        setView('failure')

        setErrorMessage(
          currentStatus === 'Expired'
            ? 'This verification session has expired.'
            : 'Identity verification could not be completed.'
        )

        return
      }

      if (
        currentStatus !== 'AwaitingLiveness' &&
        currentStatus !== 'AwaitingDocument'
      ) {
        throw new Error(
          `Verification cannot continue from state: ${currentStatus}`
        )
      }

      setConsentOpen(false)
      setReadyOpen(true)
    } catch (error) {
      setConsentOpen(false)
      setView('failure')

      setErrorMessage(
        getErrorMessage(error, 'Unable to start identity verification.')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartCamera = async () => {
    if (!verificationId) {
      setReadyOpen(false)
      setView('failure')

      setErrorMessage('Verification session could not be found.')

      return
    }

    setIsPreparingCamera(true)
    clearError()

    try {
      const session = await verificationService.createLivenessSession(
        verificationId,
        physicalSaId
      )

      if (!session.authToken) {
        throw new Error(
          'Face verification session was created without an authentication token.'
        )
      }

      setAuthToken(session.authToken)

      setReadyOpen(false)
      setCameraOpen(true)
    } catch (error) {
      setReadyOpen(false)
      setView('failure')

      setErrorMessage(
        getErrorMessage(error, 'Unable to prepare face verification.')
      )
    } finally {
      setIsPreparingCamera(false)
    }
  }

  const handleLivenessComplete = async () => {
    setCameraOpen(false)

    if (!verificationId) {
      setView('failure')

      setErrorMessage('Verification session could not be found.')

      return
    }

    setView('processing')
    clearError()

    try {
      const result = await verificationService.completeLiveness(verificationId)

      if (result.status === 'Verified') {
        showSuccess()
        return
      }

      if (result.status === 'Failed') {
        setView('failure')

        setErrorMessage(
          result.failureReason ?? 'Your identity could not be verified.'
        )

        return
      }

      const refreshed =
        await verificationService.getPhysicalVerification(verificationId)

      if (refreshed.status === 'Verified') {
        showSuccess()
        return
      }

      if (refreshed.status === 'Failed') {
        setView('failure')

        setErrorMessage(
          refreshed.failureReason ?? 'Your identity could not be verified.'
        )

        return
      }

      if (refreshed.status === 'Expired') {
        setView('failure')

        setErrorMessage('This verification session has expired.')

        return
      }

      setView('failure')

      setErrorMessage('Verification could not be completed.')
    } catch (error) {
      setView('failure')

      setErrorMessage(
        getErrorMessage(error, 'Unable to retrieve the verification result.')
      )
    }
  }

  const handleBackToMethods = () => {
    clearError()
    resetPhysicalFlow()
    setView('method')
  }

  const handleTryAgain = () => {
    clearError()
    resetPhysicalFlow()
    setView('method')
  }

  const handleContinueToCredentials = () => {
    setSuccessOpen(false)

    router.push('/citizen/activate-credentials')
  }

  return (
    <main className="min-h-full bg-background px-6 py-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl justify-center">
        {view === 'method' && (
          <VerifyMethod
            steps={FLOW_STEPS}
            currentStep={1}
            onSelectMethod={handleSelectMethod}
          />
        )}

        {view === 'activation-code' && (
          <VerifyIdentityCard
            steps={FLOW_STEPS}
            currentStep={2}
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
            onSubmit={handleActivationCodeVerification}
            onBack={handleBackToMethods}
            onEnterCodeManually={
              isActivationCodeDetected
                ? () => {
                    setIsActivationCodeDetected(false)

                    setActivationCode('')
                  }
                : undefined
            }
          />
        )}

        {view === 'physical-id' && (
          <PhysicalIdentityForm
            saId={physicalSaId}
            errorMessage={errorMessage}
            isSubmitting={isSubmitting}
            onSaIdChange={setPhysicalSaId}
            onContinue={handlePhysicalIdContinue}
            onBack={handleBackToMethods}
          />
        )}

        {view === 'failure' && (
          <VerificationFailure
            message={errorMessage}
            onTryAgain={handleTryAgain}
          />
        )}
      </div>

      <ConsentToVerify
        isOpen={consentOpen}
        userName="FlashID Citizen"
        onClose={() => setConsentOpen(false)}
        onConsent={handlePhysicalConsent}
      />

      <ReadyToVerify
        isOpen={readyOpen}
        userName="FlashID Citizen"
        onClose={() => setReadyOpen(false)}
        onCancel={() => {
          setReadyOpen(false)
          setView('physical-id')
        }}
        onStartVerification={handleStartCamera}
      />

      <LivenessCameraDialog
        open={cameraOpen}
        authToken={authToken}
        onOpenChange={setCameraOpen}
        onComplete={handleLivenessComplete}
      />

      <VerificationSuccessModal
        open={successOpen}
        variant="id-document"
        fullName="Verified citizen"
        credentialValue={physicalSaId || saId}
        onContinueAction={handleContinueToCredentials}
        onDismissAction={() => router.push('/citizen')}
      />
    </main>
  )
}
