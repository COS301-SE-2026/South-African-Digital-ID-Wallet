'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  AuditLogPreview,
  IssueCredentialForm,
  LookupCitizenCredentials,
  StatusChecklistCard,
} from '@/components/organisms'
import { handleApiError } from '@/lib/exceptionhandler'
import { getErrorStatus } from '@/lib/get-error-status'
import { citizenLookupSchema, issueCredentialSchema } from '@/schemas'
import { IssueCredentialFormValues, issueCredentialService } from '@/services'
import {
  CitizenCredentialStatus,
  CredentialType,
  IssuedCredential,
} from '@/types'

const CREDENTIAL_TYPE: CredentialType = 'DriversLicense'
const NOT_FOUND_STATUS = 404

export default function IssueDriversLicensePage() {
  const [saId, setSaId] = useState('')
  const [citizen, setCitizen] = useState<CitizenCredentialStatus | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [issued, setIssued] = useState<IssuedCredential | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const hasActiveLicense = !!citizen?.existingCredentials.some(
    (credential) =>
      credential.type === CREDENTIAL_TYPE && credential.status === 'Active'
  )

  const { mutate: lookupCitizen, isPending: isLookingUp } = useMutation({
    mutationFn: (citizenSaId: string) =>
      issueCredentialService.getCitizenStatus(citizenSaId),
    onError: (error) => {
      setCitizen(null)
      setNotFound(getErrorStatus(error) === NOT_FOUND_STATUS)
      handleApiError(error)
    },
    onSuccess: (data) => {
      setCitizen(data)
      setNotFound(false)
      setIssued(null)
      setConsentGiven(false)
      toast.success('Citizen record retrieved')
    },
  })

  const { mutate: issueCredential, isPending: isIssuing } = useMutation({
    mutationFn: (formValues: IssueCredentialFormValues) =>
      issueCredentialService.issueCredential(formValues),
    onError: (error) => {
      setIssued(null)
      handleApiError(error)
    },
    onSuccess: (data) => {
      setIssued(data)
      toast.success("Driver's licence issued")
    },
  })

  const onLookup = () => {
    setErrors({})
    const result = citizenLookupSchema.safeParse({ saId })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({ saId: fieldErrors.saId?.[0] ?? '' })
      return
    }
    lookupCitizen(result.data.saId)
  }

  const onIssue = () => {
    if (!citizen) {
      toast.error('Look up a citizen first')
      return
    }
    setErrors({})
    const result = issueCredentialSchema.safeParse({
      consentGiven,
      credentialType: CREDENTIAL_TYPE,
      saId: citizen.saId,
    })
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        consentGiven: fieldErrors.consentGiven?.[0] ?? '',
        saId: fieldErrors.saId?.[0] ?? '',
      })
      return
    }
    issueCredential(result.data)
  }
  return (
    <main className="min-h-full bg-background p-6 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <LookupCitizenCredentials
            citizen={citizen}
            errors={errors}
            isPending={isLookingUp}
            notFound={notFound}
            onLookup={onLookup}
            saId={saId}
            setErrors={setErrors}
            setSaId={setSaId}
          />
          <StatusChecklistCard
            icon={ShieldCheck}
            items={[
              { done: !!citizen, label: 'Citizen record found' },
              {
                done: citizen?.status === 'Activated',
                label: 'Citizen account activated',
              },
              {
                done: !!citizen && !hasActiveLicense,
                label: 'No active licence on file',
              },
              { done: consentGiven, label: 'POPIA consent captured' },
              { done: !!issued, label: "Driver's licence issued" },
            ]}
            title="Issuance Status"
          />
        </div>
        <IssueCredentialForm
          citizen={citizen}
          consentGiven={consentGiven}
          errors={errors}
          hasActiveLicense={hasActiveLicense}
          isPending={isIssuing}
          issued={issued}
          onIssue={onIssue}
          setConsentGiven={setConsentGiven}
          setErrors={setErrors}
        />
        <AuditLogPreview
          accountCreated={!!issued}
          action="Driver's licence credential issued"
          emptyMessage="Audit log will appear once a driver's licence has been issued."
          recordName={citizen ? `${citizen.names} ${citizen.surname}` : ''}
          status={issued?.status ?? ''}
        />
      </div>
    </main>
  )
}
