'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { FieldToggleRow } from '@/components/molecules'
import { MANDATORY_FIELDS, OPTIONAL_FIELDS } from '@/services/qr-service'
import type { FieldSelectionFormProps } from './types'

export const FieldSelectionForm = ({
  credentialId,
  credentialType,
  onContinue,
}: Readonly<FieldSelectionFormProps>) => {
  const [selectedFields, setSelectedFields] = React.useState<
    Record<string, boolean>
  >({})

  const mandatoryFields = MANDATORY_FIELDS[credentialType]
  const optionalFields = OPTIONAL_FIELDS[credentialType]
  const selectedCount = optionalFields.filter(
    (field) => selectedFields[field]
  ).length
  const allSelected = optionalFields.every((field) => selectedFields[field])

  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSelectAll = () => {
    setSelectedFields((prev) => {
      const next = { ...prev }
      optionalFields.forEach((field) => {
        next[field] = true
      })
      return next
    })
  }

  const handleContinue = () => {
    onContinue({
      credentialId,
      credentialType,
      mandatoryFields,
      selectedOptionalFields: optionalFields.filter(
        (field) => selectedFields[field]
      ),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Text variant="sub-lg" className="font-bold">
        Choose what to share
      </Text>

      <div className="rounded-lg border border-amber-400 bg-amber-100 p-4">
        <Text variant="sub-sm" className="font-bold">
          Is an official requesting your details?
        </Text>
        <Text variant="sub-sm" className="mb-3 mt-1 text-muted-foreground">
          Officials such as police officers are legally entitled to see every
          field. Select all before showing your QR code.
        </Text>
        <Button
          type="button"
          onClick={handleSelectAll}
          className="w-full gap-2 bg-amber-400 font-bold text-amber-950 hover:bg-amber-500"
        >
          {allSelected && <Check className="h-4 w-4" />}
          {allSelected ? 'All fields selected' : 'Select all for official'}
        </Button>
      </div>

      <Card className="p-0">
        <div className="px-4 pt-4">
          <Text
            variant="sub-sm"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Always shared
          </Text>
        </div>
        <div className="px-4">
          {mandatoryFields.map((field) => (
            <FieldToggleRow
              key={field}
              label={field}
              checked={true}
              onCheckedChange={() => {}}
              locked
            />
          ))}
        </div>

        <div className="border-t border-border px-4 pt-4">
          <Text
            variant="sub-sm"
            className="text-xs uppercase tracking-wide text-muted-foreground"
          >
            Optional fields
          </Text>
        </div>
        <div className="px-4 pb-4">
          {optionalFields.map((field) => (
            <FieldToggleRow
              key={field}
              label={field}
              checked={!!selectedFields[field]}
              onCheckedChange={() => toggleField(field)}
            />
          ))}
        </div>
      </Card>

      <Text variant="sub-sm" className="text-center text-muted-foreground">
        {mandatoryFields.length} shared, {selectedCount} of{' '}
        {optionalFields.length} optional selected
      </Text>

      <Button type="button" onClick={handleContinue} className="w-full">
        Review and continue
      </Button>
    </div>
  )
}
