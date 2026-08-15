'use client'
import { FC, useState } from 'react'
import { Share2 } from 'lucide-react'
import { AccountInfoRow, StatusPill, Text } from '@/components/atoms'
import { FieldSelectionForm, QrDisplay } from '@/components/organisms'
import { MANDATORY_FIELDS } from '@/services/qr-service/qr-field-definitions'
import type { QrDisclosureSelection } from '@/services/qr-service'
import { type CredentialDetailCardProps } from './types'

export const CredentialDetailCard: FC<CredentialDetailCardProps> = ({
  credential,
}) => {
  const Icon = credential.icon
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareStep, setShareStep] = useState<'disclosure' | 'qr'>('disclosure')
  const [selection, setSelection] = useState<QrDisclosureSelection>(() => ({
    credentialId: credential.id,
    credentialType: credential.qrCredentialType,
    mandatoryFields: MANDATORY_FIELDS[credential.qrCredentialType],
    selectedOptionalFields: [],
  }))

  return (
    <>
      <div className="relative rounded-3xl border border-border-grey bg-card p-5 pb-20 sm:p-6 sm:pb-24">
        <div className="pr-24 sm:pr-28">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-green/10">
              <Icon className="h-7 w-7 text-primary-green" />
            </div>
            <div className="min-w-0 flex-1">
              <Text as="h2" variant="h4" className="truncate text-deep-green">
                {credential.title}
              </Text>

              <Text
                as="p"
                variant="sub-sm"
                className="truncate text-muted-text"
              >
                {credential.issuer}
              </Text>
            </div>
          </div>
        </div>

        <div className="absolute right-5 top-5 sm:right-6 sm:top-6">
          <StatusPill intent={credential.statusIntent}>
            {credential.statusLabel}
          </StatusPill>
        </div>

        <div className="mt-6">
          <Text
            as="h3"
            variant="sub-sm"
            className="px-4 pb-2 font-semibold text-deep-green"
          >
            Details
          </Text>
          {credential.rows.map((row, index) => (
            <AccountInfoRow
              key={row.label}
              label={row.label}
              value={row.value}
              border={index < credential.rows.length - 1}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end sm:absolute sm:bottom-6 sm:right-6 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              setShareStep('disclosure')
              setIsShareOpen(true)
            }}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-deep-green bg-card px-4 text-sm font-semibold text-deep-green shadow-sm transition hover:border-national-blue hover:bg-national-blue/5 hover:text-national-blue"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {isShareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-credential-title"
        >
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={() => setIsShareOpen(false)}
          />

          <div className="relative z-10 flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none border border-border-grey bg-card shadow-2xl sm:h-[min(92dvh,900px)] sm:rounded-[32px]">
            <div className="flex items-start justify-between gap-4 border-b border-border-grey px-4 py-4 sm:px-6 sm:py-5">
              <div className="space-y-1">
                <Text
                  as="h2"
                  variant="h4"
                  className="text-deep-green"
                  id="share-credential-title"
                >
                  Share {credential.title}
                </Text>
                <Text
                  as="p"
                  variant="sub-sm"
                  className="max-w-xl text-muted-text"
                >
                  Select the fields you want to disclose and preview the QR
                  code.
                </Text>
              </div>

              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="rounded-xl border border-border-grey px-3 py-2 text-sm font-semibold text-deep-green transition hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-card p-4 sm:p-6">
              {shareStep === 'disclosure' ? (
                <FieldSelectionForm
                  credentialId={credential.id}
                  credentialType={credential.qrCredentialType}
                  onBack={() => setIsShareOpen(false)}
                  onContinue={(nextSelection) => {
                    setSelection(nextSelection)
                    setShareStep('qr')
                  }}
                  onSelectionChange={setSelection}
                  continueLabel="Generate QR code"
                />
              ) : (
                <QrDisplay
                  selection={selection}
                  onBack={() => setShareStep('disclosure')}
                  embedded
                  compact
                  showBackButton
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
