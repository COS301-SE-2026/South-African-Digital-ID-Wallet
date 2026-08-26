'use client'
import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { Modal } from '@/components/atoms/modal'
import { Button } from '@/components/atoms/button'
import { Text } from '@/components/atoms/text'
import type { RevocationReason, RevokeCredentialModalProps } from './types'
import { revocationReasons } from './constants'

export const RevokeCredentialModal = ({
  isOpen,
  onClose,
  onConfirm,
  citizenName,
  credentialLabel,
  credentialId,
  isSubmitting = false,
}: Readonly<RevokeCredentialModalProps>) => {
  const [reason, setReason] = useState<RevocationReason | ''>('')
  const [notes, setNotes] = useState('')
  const handleConfirm = async () => {
    if (!reason) return
    await onConfirm({ reason, notes })
  }
  const handleClose = () => {
    setReason('')
    setNotes('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="sm:max-w-lg"
      dataCy="revoke-credential-modal"
    >
      <div className="flex flex-col items-center px-6 pb-6 pt-10 sm:px-8">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-national-red bg-national-red/10">
          <AlertTriangle className="h-8 w-8 text-national-red" />
        </div>
        <Text as="h2" variant="h3" dataCy="revoke-credential-title">
          Revoke Credential
        </Text>
        <div className="mt-6 w-full space-y-4 rounded-xl border border-national-red bg-national-red/5 p-5">
          <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-4 text-sm">
            <span className="font-medium text-deep-green">Citizen</span>
            <span className="font-semibold text-deep-green">{citizenName}</span>
            <span className="font-medium text-deep-green">Credential</span>
            <span className="font-semibold text-deep-green">
              {credentialLabel} ({credentialId})
            </span>
            <label
              htmlFor="revocation-reason"
              className="self-center font-medium text-deep-green"
            >
              Reason
            </label>
            <select
              id="revocation-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as RevocationReason)
              }
              className="w-full rounded-lg border border-black/10 bg-clean-white px-3 py-2 text-sm text-deep-green focus:outline-none focus:ring-2 focus:ring-primary-green"
              data-cy="revocation-reason-select"
            >
              <option value="" disabled>
                Select revocation reason...
              </option>
              {revocationReasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label
              htmlFor="revocation-notes"
              className="pt-1 font-medium text-deep-green"
            >
              Additional Notes
              <br />
            </label>
            <textarea
              id="revocation-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full resize-none rounded-lg border border-black/10 bg-clean-white px-3 py-2 text-sm text-deep-green placeholder:text-muted-text/70 focus:outline-none focus:ring-2 focus:ring-primary-green"
              data-cy="revocation-notes-textarea"
            />
          </div>
        </div>

        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="!h-auto !w-auto flex-1 py-2.5"
            dataCy="revoke-cancel-button"
          >
            Cancel
          </Button>
          <Button
            variant="custom"
            onClick={handleConfirm}
            disabled={!reason}
            isLoading={isSubmitting}
            LeftIcon={ShieldCheck}
            className="!h-auto !w-auto flex-1 gap-2 border border-national-red bg-national-red py-2.5 text-clean-white hover:bg-national-red/90 disabled:cursor-not-allowed disabled:opacity-50"
            iconClassName="text-clean-white"
            dataCy="revoke-confirm-button"
          >
            Confirm Revocation
          </Button>
        </div>
      </div>
    </Modal>
  )
}
