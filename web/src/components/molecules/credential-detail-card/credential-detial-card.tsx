'use client'
import { FC, useState } from 'react'
import { Share2 } from 'lucide-react'
import { StatusPill, Text } from '@/components/atoms'
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
      <div className="rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="relative overflow-hidden rounded-[24px] bg-card p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-green/5" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-national-blue/5" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_180px]">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary-green/20 bg-gradient-to-br from-primary-green/10 to-national-blue/10 shadow-sm sm:h-16 sm:w-16">
                  <Icon className="h-7 w-7 text-primary-green sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-text sm:text-xs">
                    Digital Credential
                  </p>

                  <Text
                    as="h2"
                    variant="h4"
                    className="mt-1 truncate text-deep-green"
                  >
                    {credential.title}
                  </Text>

                  <Text
                    as="p"
                    variant="sub-sm"
                    className="mt-1 truncate text-muted-text"
                  >
                    Issued by {credential.issuer}
                  </Text>
                </div>
              </div>

              <div>
                <Text
                  as="h3"
                  variant="sub-sm"
                  className="mb-3 font-bold text-deep-green"
                >
                  Credential Details
                </Text>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {credential.rows.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-xl border border-border-grey bg-muted/30 px-4 py-3 transition hover:bg-primary-green/5"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-text">
                        {row.label}
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-deep-green">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start justify-start lg:justify-end">
              <StatusPill intent={credential.statusIntent}>
                {credential.statusLabel}
              </StatusPill>
            </div>
          </div>

          <div className="relative mt-5 flex justify-end border-t border-border-grey pt-5">
            <button
              type="button"
              onClick={() => {
                setShareStep('disclosure')
                setIsShareOpen(true)
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-deep-green bg-primary-green/5 px-5 text-sm font-semibold text-deep-green shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-national-blue hover:bg-national-blue/5 hover:text-national-blue hover:shadow-md sm:w-auto"
            >
              <Share2 className="h-4 w-4" />
              Share Credential
            </button>
          </div>
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
              </div>

              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="shrink-0 rounded-xl border border-border-grey px-3 py-2 text-sm font-semibold text-deep-green transition hover:bg-muted"
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
