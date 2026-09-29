'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms'
import { FieldToggleRow } from '@/components/molecules'
import { MANDATORY_FIELDS, OPTIONAL_FIELDS } from '@/services/qr-service'
import type { FieldSelectionFormProps } from './types'

export const FieldSelectionForm = ({
  credentialId,
  onBack,
  credentialType,
  onContinue,
  onSelectionChange,
  continueLabel = 'Review and continue',
}: Readonly<FieldSelectionFormProps>) => {
  const [selectedFields, setSelectedFields] = React.useState<
    Record<string, boolean>
  >({})

  const mandatoryFields = MANDATORY_FIELDS[credentialType]
  const optionalFields = OPTIONAL_FIELDS[credentialType]
  const selectedCount = optionalFields.filter(
    (field) => selectedFields[field]
  ).length

  const buildSelection = (fields: Record<string, boolean>) => ({
    credentialId,
    credentialType,
    mandatoryFields,
    selectedOptionalFields: optionalFields.filter((field) => fields[field]),
  })

  const toggleField = (field: string) => {
    const nextFields = { ...selectedFields, [field]: !selectedFields[field] }
    setSelectedFields(nextFields)
    onSelectionChange?.(buildSelection(nextFields))
  }

  const handleContinue = () => {
    const selection = buildSelection(selectedFields)
    onSelectionChange?.(selection)
    onContinue(selection)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col">
      <div className="mb-5">
        <Text as="h2" variant="h4" className="mt-1 text-deep-green">
          Choose what to share
        </Text>

        <Text variant="sub-sm" className="mt-1 text-muted-text">
          Required information is always shared. Toggle on anything extra you
          want included in the QR code.
        </Text>
      </div>

      <section className="overflow-hidden rounded-[24px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="overflow-hidden rounded-[22px] bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-border-grey bg-accent-gold/3 px-5 py-4">
            <div className="flex items-center gap-3">
              <div>
                <Text variant="sub-md" className="font-bold text-black">
                  Always shared
                </Text>

                <p className="mt-0.5 text-xs text-black">
                  Required credential information
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 px-4 py-4 min-[420px]:grid-cols-2 sm:px-5">
            {mandatoryFields.map((field) => (
              <div
                key={field}
                className="rounded-xl border border-primary-green/15 bg-primary-green/[0.03] px-3 py-2.5 transition hover:border-primary-green/25 hover:bg-primary-green/[0.06]"
              >
                <FieldToggleRow
                  label={field}
                  checked={true}
                  onCheckedChange={() => {}}
                  locked
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[24px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
        <div className="overflow-hidden rounded-[22px] bg-card">
          <div className="border-b border-border-grey bg-accent-gold/3 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text variant="sub-md" className="font-bold text-black">
                  Optional fields
                </Text>

                <p className="mt-0.5 text-xs text-black">
                  Choose what you want to disclose
                </p>
              </div>
            </div>
          </div>

          {optionalFields.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 px-4 py-4 min-[420px]:grid-cols-2 sm:px-5">
              {optionalFields.map((field) => {
                const isChecked = !!selectedFields[field]

                return (
                  <div
                    key={field}
                    className={`rounded-xl border px-3 py-2.5 transition ${
                      isChecked
                        ? 'border-national-blue/30 bg-national-blue/[0.06]'
                        : 'border-border-grey bg-muted/20 hover:border-national-blue/20 hover:bg-national-blue/5'
                    }`}
                  >
                    <FieldToggleRow
                      label={field}
                      checked={isChecked}
                      onCheckedChange={() => toggleField(field)}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex min-h-[100px] items-center justify-center px-5 py-6 text-center">
              <div>
                <p className="text-sm font-semibold text-deep-green">
                  No optional fields
                </p>

                <p className="mt-1 text-xs text-muted-text">
                  This credential only requires the mandatory information.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-4 border-t border-border-grey pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-green/5 to-national-blue/5 px-4 py-3">
          <p className="text-sm font-bold text-deep-green">
            {mandatoryFields.length + selectedCount} fields selected
          </p>
        </div>

        <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="h-11 rounded-xl px-6 sm:min-w-[120px]"
          >
            Go back
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
            className="h-11 rounded-xl bg-primary-green px-7 text-white shadow-sm transition hover:bg-primary-green/90 sm:min-w-[190px]"
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
