'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { IdentityRecord } from '@/types'
import { onboardingSchema, retrivalSchema } from '@/schemas'
import {
  OnboardCitizenFormValues,
  OnboardCitizenResponse,
  onboardingService,
} from '@/services/onboarding-service'

import {
  AuditLogPreview,
  CaptureContactDetails,
  OnboardingStatusCard,
  RetrieveIdentityRecord,
} from '@/components/organisms'
import { handleApiError } from '@/lib/exceptionhandler'

export default function OnboardCitizenPage() {
  const [idNumber, setIdNumber] = useState('')
  const [record, setRecord] = useState<IdentityRecord | null>(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [idConsent, setConsent] = useState(false)
  const [contactDetailsConsent, setContactConsent] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [activationSent, setActivationSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [onboardResponse, setOnboardResponse] =
    useState<OnboardCitizenResponse | null>(null)

  const { mutate: retrieveRecord, isPending: isRetrievingRecord } = useMutation(
    {
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
    }
  )

  const { mutate: onboardCitizen, isPending: isCreatingAccount } = useMutation({
    mutationFn: (formValues: OnboardCitizenFormValues) =>
      onboardingService.onboardCitizen(formValues),
    onSuccess: (data) => {
      setOnboardResponse(data)
      setAccountCreated(true)
      toast.success('Pending FlashID account created')
    },
    onError: (error) => {
      setOnboardResponse(null)
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

  const createPendingAccount = async () => {
    if (!record) {
      toast.error('Retrieve the citizen record first')
      return
    }

    const nameParts = record.fullName.trim().split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || 'Unknown'

    setErrors({})

    const result = onboardingSchema.safeParse({
      phone,
      email,
      contactDetailsConsent,
      idConsent,
    })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors

      setErrors({
        phone: fieldErrors.phone?.[0] ?? '',
        email: fieldErrors.email?.[0] ?? '',
        contactDetailsConsent: fieldErrors.contactDetailsConsent?.[0] ?? '',
        idConsent: fieldErrors.idConsent?.[0] ?? '',
      })

      return
    }

    await onboardCitizen({
      idNumber: record.saId,
      email: result.data.email,
      phoneNumber: result.data.phone,
      consentProvided: result.data.contactDetailsConsent,
    })
  }

  // function sendActivationCode() {
  //   setActivationSent(true)
  // }

  return (
    <main className="min-h-full bg-background p-6 pb-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <RetrieveIdentityRecord
            idNumber={idNumber}
            setIdNumber={setIdNumber}
            idConsent={idConsent}
            setConsent={setConsent}
            record={record}
            retrieveIdentityRecord={retrieveIdentityRecord}
            errors={errors}
            setErrors={setErrors}
          />

          <OnboardingStatusCard
            record={record}
            idConsent={idConsent}
            contactDetailsConsent={contactDetailsConsent}
            phone={phone}
            email={email}
            accountCreated={accountCreated}
            activationSent={activationSent}
          />
        </div>

        <CaptureContactDetails
          record={record}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          contactDetailsConsent={contactDetailsConsent}
          setContactConsent={setContactConsent}
          idConsent={idConsent}
          createPendingAccount={createPendingAccount}
          accountCreated={accountCreated}
          //sendActivationCode={sendActivationCode}
          errors={errors}
          setErrors={setErrors}
          onboardResponse={onboardResponse}
        />

        <AuditLogPreview
          recordName={record?.fullName}
          accountCreated={accountCreated}
        />
      </div>
    </main>
  )
}
