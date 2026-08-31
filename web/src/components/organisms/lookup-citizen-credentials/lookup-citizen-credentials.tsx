'use client'

import { useRouter } from 'next/navigation'
import { Search, UserRoundPlus } from 'lucide-react'

import { AccountInfoRow, Button, StatusPill, Text } from '@/components/atoms'
import { TextField } from '@/components/molecules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CITIZEN_STATUS_INTENTS,
  CREDENTIAL_STATUS_INTENTS,
  CREDENTIAL_TYPE_LABELS,
} from '@/lib/status-intents'
import { cn } from '@/lib/utils'

import type { LookupCitizenCredentialsProps } from './types'

const ONBOARDING_ROUTE = '/officials/onboard-citizen'

export const LookupCitizenCredentials = ({
  citizen,
  className,
  errors,
  isPending,
  notFound,
  onLookup,
  saId,
  setErrors,
  setSaId,
}: Readonly<LookupCitizenCredentialsProps>) => {
  const router = useRouter()
  return (
    <Card className={cn('lg:col-span-2', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-deep-green" />
          <Text variant="h4">Look Up Citizen</Text>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Text as="label" htmlFor="saId" variant="sub-sm">
            Citizen SA ID number
          </Text>
          <TextField
            error={errors.saId}
            id="saId"
            onChange={(event) => {
              setSaId(event.target.value)
              setErrors({ ...errors, saId: '' })
            }}
            placeholder="Enter 13 digit South African ID number"
            value={saId}
          />
        </div>
        <Button
          className="lg:w-auto"
          disabled={!saId}
          isLoading={isPending}
          LeftIcon={Search}
          onClick={onLookup}
          variant="primary"
        >
          Look Up Citizen
        </Button>
        {notFound && (
          <div className="flex flex-col gap-3 rounded-xl border border-danger-red/55 bg-danger-red/5 p-4">
            <Text variant="sub-sm">
              No FlashID record exists for this ID number. The citizen must be
              onboarded before a credential can be issued.
            </Text>
            <Button
              className="lg:w-auto"
              LeftIcon={UserRoundPlus}
              onClick={() => router.push(ONBOARDING_ROUTE)}
              variant="secondary"
            >
              Route to onboarding
            </Button>
          </div>
        )}
        {citizen && (
          <div className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-4">
              <Text variant="h4">
                {citizen.names} {citizen.surname}
              </Text>
              <StatusPill intent={CITIZEN_STATUS_INTENTS[citizen.status]}>
                {citizen.status}
              </StatusPill>
            </div>
            <div className="flex flex-col">
              <AccountInfoRow label="ID number" value={citizen.saId} />
              <AccountInfoRow
                label="Date of birth"
                value={citizen.dateOfBirth}
              />
              {citizen.status === 'Activated' && (
                <>
                  <AccountInfoRow label="Phone" value={citizen.phoneNumber} />
                  <AccountInfoRow label="Email" value={citizen.email} />
                </>
              )}
              <AccountInfoRow
                border={false}
                label="Activated on"
                value={citizen.activatedAt ?? 'Not activated'}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Text variant="label">Existing credentials</Text>
              {citizen.existingCredentials.length === 0 ? (
                <Text variant="sub-sm">
                  No credentials have been issued to this citizen yet.
                </Text>
              ) : (
                citizen.existingCredentials.map((credential) => (
                  <AccountInfoRow
                    key={`${credential.type}-${credential.issueDate}`}
                    label={CREDENTIAL_TYPE_LABELS[credential.type]}
                    value={
                      <StatusPill
                        intent={CREDENTIAL_STATUS_INTENTS[credential.status]}
                      >
                        {credential.status}
                      </StatusPill>
                    }
                  />
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
