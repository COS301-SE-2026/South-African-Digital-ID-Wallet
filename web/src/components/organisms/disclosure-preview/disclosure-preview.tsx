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
    <div className="flex flex-col gap-4">
      <Text variant="sub-lg">Confirm what you&apos;re sharing</Text>
      <Text variant="sub-sm" className="text-muted-foreground">
        {CREDENTIAL_TYPE_LABELS[credentialType]}
      </Text>

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <Text variant="sub-sm" className="text-muted-foreground">
          This is exactly what the verifier will see when they scan your QR
          code.
        </Text>
      </div>

      <Card className="p-0">
        {allDisclosedFields.map((field) => (
          <div
            key={field}
            className="border-b border-border px-4 py-3 last:border-b-0"
          >
            <Text variant="sub-sm">{field}</Text>
          </div>
        ))}
      </Card>

      <Text variant="sub-sm" className="text-center text-muted-foreground">
        {allDisclosedFields.length} field
        {allDisclosedFields.length === 1 ? '' : 's'} will be shared
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
        <Button type="button" onClick={onConfirm} className="flex-[2]">
          Confirm and generate QR
        </Button>
      </div>
    </div>
  )
}
