'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { IdentityRecord } from '@/types'
import { retrivalSchema, type ContactDetailsFormData } from '@/schemas'
import {
  OnboardCitizenResponse,
  onboardingService,
} from '@/services/onboarding-service'

import {
  AuditLogPreview,
  CaptureContactDetails,
  OnboardSuccessPanel,
  OnboardingStatusCard,
  RetrieveIdentityRecord,
} from '@/components/organisms'
import { handleApiError } from '@/lib/exceptionhandler'

export default function OnboardCitizenPage() {
  const [idNumber, setIdNumber] = useState('')
  const [record, setRecord] = useState<IdentityRecord | null>(null)
  const [idConsent, setidConsent] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [activationSent, setActivationSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [onboardResponse, setOnboardResponse] =
    useState<OnboardCitizenResponse | null>(null)

  const { mutate: retrieveRecord } = useMutation({
    mutationFn: (citizenIdNumber: string) =>
      onboardingService.retrieveIdentityRecord(citizenIdNumber),
    onSuccess: (data) => {
      setRecord(data)
      setAccountCreated(false)
      setActivationSent(false)
      toast.success('Identity record retrieved')
    },
    onError: (error) => {
      setRecord(null)
      handleApiError(error)
    },
  })

  const retrieveIdentityRecord = async () => {
    if (!idNumber.trim()) {
      toast.error('Enter an ID number first')
      return
    }

    setErrors({})

    const result = retrivalSchema.safeParse({ idNumber, idConsent })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors

      setErrors({
        idNumber: fieldErrors.idNumber?.[0] ?? '',
        idConsent: fieldErrors.idConsent?.[0] ?? '',
      })

      return
    }

    await retrieveRecord(result.data.idNumber)
  }

  const handleCaptureContactDetails = (formData: ContactDetailsFormData) => {
    if (!record) {
      toast.error('Retrieve the citizen record first')
      return Promise.reject(new Error('No identity record'))
    }

    return onboardingService
      .onboardCitizen({
        consentProvided: formData.contactDetailsConsent,
        email: formData.email,
        idNumber: record.saId,
        phoneNumber: formData.phone,
      })
      .then((data) => {
        setOnboardResponse(data)
        setAccountCreated(true)
        toast.success('Pending FlashID account created')
      })
      .catch((error) => {
        setOnboardResponse(null)
        handleApiError(error)
        throw error
      })
  }

  return (
    <main className="min-h-full bg-background p-6 pb-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <RetrieveIdentityRecord
            idNumber={idNumber}
            setIdNumber={setIdNumber}
            idConsent={idConsent}
            setConsent={setidConsent}
            record={record}
            retrieveIdentityRecord={retrieveIdentityRecord}
            errors={errors}
            setErrors={setErrors}
          />

          <OnboardingStatusCard
            record={record}
            idConsent={idConsent}
            accountCreated={accountCreated}
            activationSent={activationSent}
          />
        </div>

        <CaptureContactDetails onSubmitForm={handleCaptureContactDetails} />

        {accountCreated && onboardResponse && (
          <OnboardSuccessPanel response={onboardResponse}></OnboardSuccessPanel>
        )}

        <AuditLogPreview
          recordName={record?.fullName}
          accountCreated={accountCreated}
        />
      </div>
    </main>
  )
}
