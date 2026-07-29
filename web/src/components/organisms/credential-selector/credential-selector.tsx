'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { qrService } from '@/services/qr-service'
import type { CredentialSelectorProps } from './types'
const mapCredentialType = (label: string) =>
  label === "Driver's License" ? 'driversLicense' : 'identityDocument'
export const CredentialSelector = ({
  onSelect,
}: Readonly<CredentialSelectorProps>) => {
  const {
    data: credentials,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['qr-credentials-mine'],
    queryFn: qrService.getMine,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Text variant="sub-md">Loading your credentials...</Text>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Text variant="sub-md" className="text-destructive">
          Could not load your credentials. Please try again.
        </Text>
      </div>
    )
  }

  if (!credentials || credentials.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Text variant="sub-md" className="text-muted-foreground">
          You don&apos;t have any active credentials yet.
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Text variant="sub-lg">Select a credential</Text>
      <div className="flex flex-col gap-3">
        {credentials.map((credential) => (
          <Card
            key={credential.id}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer flex-row items-center justify-between p-4 transition-colors hover:bg-muted"
            onClick={() =>
              onSelect(
                credential.id,
                mapCredentialType(credential.credentialType)
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(
                  credential.id,
                  mapCredentialType(credential.credentialType)
                )
              }
            }}
          >
            <Text variant="sub-sm">{credential.credentialType}</Text>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        ))}
      </div>
    </div>
  )
}
