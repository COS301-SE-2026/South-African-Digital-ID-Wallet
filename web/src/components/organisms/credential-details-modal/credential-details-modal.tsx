'use client'
import { useState } from 'react'
import { Modal } from '@/components/atoms/modal'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import { StatusPill } from '@/components/atoms/status-pill'
import { cn } from '@/lib/utils'
import type { CredentialDetailsModalProps } from './types'
import Image from 'next/image'

export function CredentialDetailsModal({
  isOpen,
  onClose,
  citizenName,
  credentials,
  onRevoke,
}: Readonly<CredentialDetailsModalProps>) {
  const [selectedId, setSelectedId] = useState(credentials[0]?.id)
  const selected =
    credentials.find((credential) => credential.id === selectedId) ??
    credentials[0]
  if (!selected) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} dataCy="credential-details-modal">
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <Text as="span" variant="sub-sm" className="text-muted-text">
          Credentials
          <span className="mx-1">›</span>
          {citizenName}
          <span className="mx-1">›</span>
          {selected.label}
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

          <div className="flex justify-end">
            <Button
              variant="secondary"
              className="!h-auto !w-auto !border-national-red px-4 py-2 text-sm !text-national-red hover:!bg-national-red hover:!text-clean-white"
              onClick={() => onRevoke?.(selected)}
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
                      {selected.credentialId}
                    </span>
                  </div>
                  <div className="flex items-center gap-10">
                    <span className="text-sm text-muted-text">Status:</span>
                    <StatusPill intent={selected.status}>
                      {selected.status}
                    </StatusPill>
                  </div>
                  <div className="flex items-center gap-10">
                    <span className="text-sm text-muted-text">Issued On:</span>
                    <span className="text-sm font-semibold text-deep-green">
                      {selected.issuedOn}
                    </span>
                  </div>
                  <div className="flex items-center gap-10">
                    <span className="text-sm text-muted-text">Expires On:</span>
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
                    <span className="text-sm text-muted-text">Full Name:</span>
                    <span className="text-sm font-semibold text-deep-green">
                      {selected.citizen.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-text">ID Number:</span>
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
                    <span className="text-sm text-muted-text">Department:</span>

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
                    <span className="text-sm text-muted-text">Reference:</span>
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
  )
}
