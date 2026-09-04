'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosError } from 'axios'

import { ActivateCredentialsForm } from '@/components/organisms/activate-credentials-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'

import { activateCredentialsService } from '@/services/activate-credentials-service'
import type { CredentialType } from '@/services/activate-credentials-service'

type Selection = {
  identityDocument: boolean
  driversLicense: boolean
}

type Status = 'select' | 'success' | 'error'

type ProblemDetails = {
  title?: string
  detail?: string
  message?: string
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ProblemDetails>

  return (
    axiosError.response?.data?.detail ??
    axiosError.response?.data?.message ??
    axiosError.response?.data?.title ??
    fallback
  )
}

export function ActivateCredentialsPage() {
  const router = useRouter()

  const [selection, setSelection] = useState<Selection>({
    identityDocument: false,
    driversLicense: false,
  })

  const [status, setStatus] = useState<Status>('select')

  const [message, setMessage] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const selectedTypes: CredentialType[] = []

    if (selection.identityDocument) {
      selectedTypes.push('identityDocument')
    }

    if (selection.driversLicense) {
      selectedTypes.push('driversLicense')
    }

    if (selectedTypes.length === 0) {
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await activateCredentialsService.activate(selectedTypes)

      setMessage(response.message)
      setStatus('success')
    } catch (error) {
      setMessage(
        getErrorMessage(
          error,
          'We could not activate your selected credentials.'
        )
      )

      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push('/citizen/verify-identity')
  }

  const handleViewCredentials = () => {
    router.push('/citizen/my-credentials')
  }

  const handleTryAgain = () => {
    setMessage('')
    setStatus('select')
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      {status === 'select' && (
        <ActivateCredentialsForm
          selection={selection}
          onSelectionChange={setSelection}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}

      {status === 'success' && (
        <Card className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-white p-8 text-center shadow-xl shadow-deep-green/10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-green/10">
            <div className="size-4 rounded-full bg-primary-green" />
          </div>

          <Text variant="h3" className="mt-5 text-deep-green">
            Credentials activated
          </Text>

          <Text variant="sub-md" className="mt-3 text-muted-foreground">
            {message}
          </Text>

          <Button
            type="button"
            className="mt-8 w-full"
            onClick={handleViewCredentials}
          >
            View My Credentials
          </Button>
        </Card>
      )}

      {status === 'error' && (
        <Card className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-deep-green/10">
          <Text variant="h3">Activation unsuccessful</Text>

          <Text variant="sub-md" className="mt-3 text-muted-foreground">
            {message}
          </Text>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={handleTryAgain}
          >
            Try Again
          </Button>
        </Card>
      )}
    </div>
  )
}
