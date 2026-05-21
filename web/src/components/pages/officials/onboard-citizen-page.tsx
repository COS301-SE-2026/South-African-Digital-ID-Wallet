'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { IdentityRecord } from '@/types'
import {
  OnboardCitizenFormValues,
  onboardingService,
} from '@/services/onboarding-service'

import {
  AuditLogPreview,
  CaptureContactDetails,
  OnboardingStatusCard,
  RetrieveIdentityRecord,
} from '@/components/organisms'

export default function OnboardCitizenPage() {
  const [idNumber, setIdNumber] = useState('')
  const [record, setRecord] = useState<IdentityRecord | null>(null)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [idConsent, setConsent] = useState(false)
  const [contactDetailsConsent, setContactConsent] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const [activationSent, setActivationSent] = useState(false)

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
      onError: () => {
        setRecord(null)
        toast.error('Could not retrieve identity record')
      },
    }
  )

  const { mutate: onboardCitizen, isPending: isCreatingAccount } = useMutation({
    mutationFn: (formValues: OnboardCitizenFormValues) =>
      onboardingService.onboardCitizen(formValues),
    onSuccess: () => {
      setAccountCreated(true)
      toast.success('Pending FlashID account created')
    },
    onError: () => {
      toast.error('Could not create pending FlashID account')
    },
  })

  function retrieveIdentityRecord() {
    if (!idNumber.trim()) {
      toast.error('Enter an ID number first')
      return
    }

    retrieveRecord(idNumber.trim())
  }

  function createPendingAccount() {
    if (!record) {
      toast.error('Retrieve the citizen record first')
      return
    }

    const nameParts = record.fullName.trim().split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || 'Unknown'

    onboardCitizen({
      idNumber: record.idNumber,
      email,
      phoneNumber: phone,
      consentProvided: contactDetailsConsent,
    })
  }

  function sendActivationCode() {
    setActivationSent(true)
  }

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
          sendActivationCode={sendActivationCode}
        />

        <AuditLogPreview
          recordName={record?.fullName}
          accountCreated={accountCreated}
        />
      </div>
    </main>
  )
}
