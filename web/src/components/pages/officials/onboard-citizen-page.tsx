'use client'

import { useState } from 'react'

import { IdentityRecord } from '@/types'
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

  function retrieveIdentityRecord() {
    setRecord({
      idNumber,
      fullName: 'Thando Mokoena',
      dateOfBirth: '1998-04-12',
      status: 'Verified',
    })
  }

  function createPendingAccount() {
    setAccountCreated(true)
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
