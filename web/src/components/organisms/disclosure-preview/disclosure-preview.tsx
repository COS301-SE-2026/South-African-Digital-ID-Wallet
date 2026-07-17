'use client'

import * as React from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import type { DisclosurePreviewProps } from './types'

const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  identityDocument: 'Identity document',
  driversLicense: "Driver's license",
}

export const DisclosurePreview = ({
  selection,
  onConfirm,
  onBack,
}: Readonly<DisclosurePreviewProps>) => {
  const { credentialType, mandatoryFields, selectedOptionalFields } = selection
  const allDisclosedFields = [...mandatoryFields, ...selectedOptionalFields]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-muted-foreground" />
        <Text variant="sub-lg">Review what you&apos;re sharing</Text>
      </div>

      <Text variant="sub-sm" className="text-muted-foreground">
        The verifier will see exactly the fields listed below for your{' '}
        {CREDENTIAL_TYPE_LABELS[credentialType]}, nothing more.
      </Text>

      <Card className="p-4">
        <Text
          variant="sub-sm"
          className="mb-2 text-xs uppercase tracking-wide text-muted-foreground"
        >
          Visible to verifier ({allDisclosedFields.length} fields)
        </Text>
        <ul className="flex flex-col gap-1">
          {allDisclosedFields.map((field) => (
            <li key={field}>
              <Text variant="sub-sm">{field}</Text>
            </li>
          ))}
        </ul>
      </Card>

      {selectedOptionalFields.length === 0 && (
        <Text variant="sub-sm" className="text-muted-foreground">
          Only the required fields will be shared. You can go back to add
          optional fields if needed.
        </Text>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="button" onClick={onConfirm} className="flex-1">
          Generate QR code
        </Button>
      </div>
    </div>
  )
}
