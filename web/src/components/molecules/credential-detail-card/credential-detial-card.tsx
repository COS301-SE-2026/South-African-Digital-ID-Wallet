'use client'

import { FC } from 'react'
import { AccountInfoRow, StatusPill, Button, Text } from '@/components/atoms'

import { type CredentialDetailCardProps } from './types'

export const CredentialDetailCard: FC<CredentialDetailCardProps> = ({
  credential,
}) => {
  const Icon = credential.icon

  return (
    <div className="bg-card rounded-3xl border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <Text as="h2" variant="h4">
              {credential.title}
            </Text>
            <Text as="p" variant="sub-sm">
              {credential.issuer}
            </Text>
          </div>
        </div>
        <StatusPill intent={credential.statusIntent}>
          {credential.statusLabel}
        </StatusPill>
      </div>

      <div className="mt-6">
        <Text
          as="h3"
          variant="sub-sm"
          className="text-deep-green px-4 pb-2 font-semibold"
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

      <div className="mt-6 flex gap-3">
        <Button variant="secondary">Share QR Code</Button>
      </div>
    </div>
  )
}
