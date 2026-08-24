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
        {/* still adding info cards. issued by, user cred info with image,and user ifno */}
      </div>
    </Modal>
  )
}
