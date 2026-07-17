'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/atoms'
import { FieldToggleRow } from '@/components/molecules'
import {
  MANDATORY_FIELDS,
  OPTIONAL_FIELDS,
  CredentialType,
} from '@/services/qr-service'
import type { FieldSelectionFormProps } from './types'

export const FieldSelectionForm = ({
  credentialId,
  onContinue,
}: Readonly<FieldSelectionFormProps>) => {
  const [credentialType, setCredentialType] =
    React.useState<CredentialType>('identityDocument')

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
    <div className="flex flex-col gap-6">
      <Text variant="sub-lg">Choose what to share</Text>

      <Tabs
        value={credentialType}
        onValueChange={(value) => setCredentialType(value as CredentialType)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="identityDocument" className="flex-1">
            Identity document
          </TabsTrigger>
          <TabsTrigger value="driversLicense" className="flex-1">
            Driver&apos;s license
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-amber-400 bg-amber-50 p-4">
        <Text variant="sub-sm">Is an official requesting your details?</Text>
        <Text variant="sub-sm" className="mb-3 mt-1 text-muted-foreground">
          Officials such as police officers are legally entitled to see every
          field. Select all before showing your QR code.
        </Text>
        <Button
          type="button"
          onClick={handleSelectAll}
          className="w-full gap-2"
          variant="secondary"
        >
          {allSelected && <Check className="h-4 w-4" />}
          {allSelected ? 'All fields selected' : 'Select all for official'}
        </Button>
      </div>

      <div>
        <Text
          variant="sub-sm"
          className="mb-2 text-xs uppercase tracking-wide text-muted-foreground"
        >
          Always shared
        </Text>
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

      <div>
        <Text
          variant="sub-sm"
          className="mb-2 text-xs uppercase tracking-wide text-muted-foreground"
        >
          Optional fields
        </Text>
        {optionalFields.map((field) => (
          <FieldToggleRow
            key={field}
            label={field}
            checked={!!selectedFields[field]}
            onCheckedChange={() => toggleField(field)}
          />
        ))}
      </div>

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
