'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <div className="flex flex-col gap-4">
      <Text variant="sub-lg" className="font-bold">
        Choose what to share
      </Text>

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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="flex-1"
        >
          Go back
        </Button>
        <Button type="button" onClick={handleContinue} className="flex-[2]">
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}
