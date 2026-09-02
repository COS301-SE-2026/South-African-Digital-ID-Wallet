'use client'
import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Modal } from '@/components/atoms/modal'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { StatusPill } from '@/components/atoms/status-pill'
import { RevokeCredentialModal } from '@/components/organisms/revoke-credentials-modal'
import { cn } from '@/lib/utils'
import type { StatusPillIntent } from '@/components/atoms/status-pill'
import type { CredentialDetailsModalProps, CredentialStatus } from './types'
import Image from 'next/image'

const CREDENTIAL_STATUS_PILL_INTENTS: Record<
  CredentialStatus,
  StatusPillIntent
> = {
  Active: 'active',
  Expired: 'inactive',
  Inactive: 'inactive',
  Investigation: 'warning',
  Revoked: 'danger',
}

export function CredentialDetailsModal({
  isOpen,
  onClose,
  citizenName,
  credentials,
  onRevoke,
  onReinstate,
}: Readonly<CredentialDetailsModalProps>) {
  const [selectedId, setSelectedId] = useState(credentials[0]?.id)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)
  const [isReinstating, setIsReinstating] = useState(false)
  const selected =
    credentials.find((credential) => credential.id === selectedId) ??
    credentials[0]
  if (!selected) {
    return null
  }

  const handleConfirmRevoke = async (payload: {
    reason: import('@/components/organisms/revoke-credentials-modal').RevocationReason
    notes: string
  }) => {
    try {
      setIsRevoking(true)
      await onRevoke?.(selected, payload)
      setIsRevokeModalOpen(false)
    } finally {
      setIsRevoking(false)
    }
  }

  const handleReinstate = async () => {
    const confirmed = window.confirm(
      `Reinstate ${selected.label} for ${selected.citizen.fullName}? This will restore it to active status.`
    )
    if (!confirmed) return

    try {
      setIsReinstating(true)
      await onReinstate?.(selected)
    } finally {
      setIsReinstating(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        dataCy="credential-details-modal"
      >
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Text as="span" variant="sub-sm" className="text-muted-text">
            <span>Credentials</span>
            <span className="mx-1">/</span>
            <span>{citizenName}</span>
            <span className="mx-1">/</span>
            <span>{selected.label}</span>
          </Text>

          <div className="mt-2 grid grid-cols-2 items-center gap-6">
            <div className="mt-6 flex flex-wrap gap-2">
              {credentials.map((credential) => (
                <button
                  key={credential.id}
                  type="button"
                  onClick={() => setSelectedId(credential.id)}
                  className={cn(
                    'rounded-full border border-national-blue px-4 py-2 text-sm font-medium transition-colors',
                    credential.id === selected.id
                      ? 'bg-deep-green text-clean-white'
                      : 'bg-clean-white text-deep-green hover:bg-deep-green/5'
                  )}
                  data-cy={`credential-tab-${credential.type}`}
                >
                  {credential.label}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="custom"
                onClick={handleReinstate}
                disabled={
                  (selected.status !== 'Revoked' &&
                    selected.status !== 'Investigation') ||
                  isReinstating
                }
                isLoading={isReinstating}
                LeftIcon={RotateCcw}
                className="!h-auto !w-auto gap-2 border border-primary-green px-4 py-2 text-sm text-primary-green hover:bg-primary-green hover:text-clean-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary-green"
                dataCy="reinstate-credential"
              >
                Reinstate Credential
              </Button>

              <Button
                variant="secondary"
                onClick={() => setIsRevokeModalOpen(true)}
                disabled={selected.status === 'Revoked'}
                className="!h-auto !w-auto !border-national-red px-4 py-2 text-sm !text-national-red hover:!bg-national-red hover:!text-clean-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:!bg-transparent disabled:hover:!text-national-red"
                dataCy="revoke-credential"
              >
                Revoke Credential
              </Button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-[0.8fr_1.2fr] gap-6">
            <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
              <div className="h-full rounded-[24px] bg-clean-white p-6">
                <div className="flex justify-center">
                  <div className="relative h-48 w-48 overflow-hidden rounded-xl border-2 border-primary-green">
                    <Image
                      src="/images/mock-citizen.jpg"
                      alt={`${selected.citizen.fullName} profile`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Text
                    as="h3"
                    variant="sub-md"
                    className="mb-4 font-semibold text-deep-green"
                  >
                    Credential Information
                  </Text>
                  <div className="space-y-3">
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-muted-text">
                        Credential Type:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-muted-text">
                        Credential ID:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.displayReference}
                      </span>
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-muted-text">Status:</span>
                      <StatusPill
                        intent={CREDENTIAL_STATUS_PILL_INTENTS[selected.status]}
                      >
                        {selected.status}
                      </StatusPill>
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-muted-text">
                        Issued On:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.issuedOn}
                      </span>
                    </div>
                    <div className="flex items-center gap-10">
                      <span className="text-sm text-muted-text">
                        Expires On:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.expiresOn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
                <div className="rounded-[24px] bg-clean-white p-6">
                  <Text
                    as="h3"
                    variant="sub-md"
                    className="mb-4 font-semibold text-deep-green"
                  >
                    Citizen Information
                  </Text>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">
                        Full Name:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.citizen.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">
                        ID Number:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.citizen.idNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">
                        Date of Birth:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.citizen.dateOfBirth}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">Contact:</span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.citizen.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">Address:</span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.citizen.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
                <div className="rounded-[24px] bg-clean-white p-6">
                  <Text
                    as="h3"
                    variant="sub-md"
                    className="mb-4 font-semibold text-deep-green"
                  >
                    Issued By
                  </Text>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">
                        Administrator:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.issuedBy.administrator}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">
                        Department:
                      </span>

                      <span className="text-sm font-semibold text-deep-green">
                        {selected.issuedBy.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">Office:</span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.issuedBy.office}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-text">
                        Reference:
                      </span>
                      <span className="text-sm font-semibold text-deep-green">
                        {selected.issuedBy.reference}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <RevokeCredentialModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleConfirmRevoke}
        citizenName={selected.citizen.fullName}
        credentialLabel={selected.label}
        credentialId={selected.displayReference}
        isSubmitting={isRevoking}
      />
    </>
  )
}
