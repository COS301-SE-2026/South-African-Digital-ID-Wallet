'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, CreditCard, IdCard, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/atoms'
import { qrService } from '@/services/qr-service'
import type { CredentialSelectorProps } from './types'

const mapCredentialType = (label: string) =>
  label === "Driver's License" ? 'driversLicense' : 'identityDocument'

const getCredentialMeta = (label: string) => {
  const normalized = label.toLowerCase()

  if (normalized.includes('driver')) {
    return {
      icon: CreditCard,
      accent: 'from-amber-100 via-white to-amber-50',
      badge: 'Driver licence',
    }
  }

  if (normalized.includes('id') || normalized.includes('identity')) {
    return {
      icon: IdCard,
      accent: 'from-emerald-100 via-white to-emerald-50',
      badge: 'Identity document',
    }
  }

  return {
    icon: ShieldCheck,
    accent: 'from-slate-100 via-white to-slate-50',
    badge: 'Credential',
  }
}

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
      <div className="space-y-1">
        <Text variant="sub-lg">Select a credential</Text>
        <Text variant="sub-sm" className="text-muted-foreground">
          Choose which credential you want to share.
        </Text>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {credentials.map((credential) =>
          (() => {
            const meta = getCredentialMeta(credential.credentialType)
            const Icon = meta.icon

            return (
              <Card
                key={credential.id}
                role="button"
                tabIndex={0}
                className={`group flex min-h-[7.5rem] cursor-pointer flex-col justify-between overflow-hidden border border-border/70 bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 hover:border-deep-green hover:shadow-md ${meta.accent}`}
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
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-black/5">
                      <Icon className="h-5 w-5 text-deep-green" />
                    </div>

                    <div className="min-w-0">
                      <Text variant="sub-sm" className="truncate font-semibold">
                        {credential.credentialType}
                      </Text>
                      <Text variant="caption" className="text-muted-foreground">
                        {meta.badge}
                      </Text>
                    </div>
                  </div>

                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-card/80 px-2.5 py-1 text-[11px] font-semibold text-deep-green ring-1 ring-black/5">
                    Tap to continue
                  </span>
                </div>
              </Card>
            )
          })()
        )}
      </div>
    </div>
  )
}
