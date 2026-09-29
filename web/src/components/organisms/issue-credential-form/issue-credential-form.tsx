'use client'

import { ClipboardCheck } from 'lucide-react'

import { AccountInfoRow, Button, StatusPill, Text } from '@/components/atoms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CREDENTIAL_STATUS_INTENTS } from '@/lib/status-intents'

import type { IssueCredentialFormProps } from './types'

const CONSENT_INPUT_ID = 'issue-credential-consent'

const BLOCKED_MESSAGES = {
  HAS_ACTIVE_LICENSE:
    "This citizen already has an active driver's licence credential.",
  NOT_ACTIVATED:
    'The citizen account must be Activated in FlashID before a credential can be issued.',
  NO_CITIZEN: 'Look up a citizen to begin issuing a credential.',
} as const

export const IssueCredentialForm = ({
  citizen,
  className,
  consentGiven,
  errors,
  hasActiveLicense,
  isPending,
  issued,
  onIssue,
  setConsentGiven,
  setErrors,
}: Readonly<IssueCredentialFormProps>) => {
  let blockedMessage: string | null = null
  if (!citizen) {
    blockedMessage = BLOCKED_MESSAGES.NO_CITIZEN
  } else if (citizen.status !== 'Activated') {
    blockedMessage = BLOCKED_MESSAGES.NOT_ACTIVATED
  } else if (hasActiveLicense) {
    blockedMessage = BLOCKED_MESSAGES.HAS_ACTIVE_LICENSE
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-deep-green" />
          <Text variant="h4">Issue Driver&apos;s Licence</Text>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {citizen && (
          <div className="flex flex-col rounded-xl border p-2">
            <AccountInfoRow
              label="Issuing to"
              value={`${citizen.names} ${citizen.surname}`}
            />
            <AccountInfoRow
              border={false}
              label="ID number"
              value={citizen.saId}
            />
          </div>
        )}
        {blockedMessage && <Text variant="sub-sm">{blockedMessage}</Text>}
        <div className="flex items-start gap-3 rounded-xl border p-4">
          <Checkbox
            checked={consentGiven}
            className="mt-1"
            disabled={!!blockedMessage}
            id={CONSENT_INPUT_ID}
            onCheckedChange={(checked) => {
              setConsentGiven(checked === true)
              setErrors({ ...errors, consentGiven: '' })
            }}
          />
          <Text as="label" htmlFor={CONSENT_INPUT_ID} variant="sub-sm">
            Citizen has provided explicit consent for FlashID to retrieve and
            issue their driver&apos;s licence credential.
          </Text>
        </div>
        {errors.consentGiven && (
          <Text className="text-danger-red" variant="sub-sm">
            {errors.consentGiven}
          </Text>
        )}
        <Button
          className="lg:w-auto"
          disabled={!!blockedMessage || !consentGiven}
          isLoading={isPending}
          onClick={onIssue}
          variant="primary"
        >
          Issue Driver&apos;s Licence
        </Button>
        {issued && (
          <div className="flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-4">
              <Text variant="h4">{issued.title}</Text>
              <StatusPill intent={CREDENTIAL_STATUS_INTENTS[issued.status]}>
                {issued.status}
              </StatusPill>
            </div>
            <div className="flex flex-col">
              <AccountInfoRow label="Issued by" value={issued.issuedBy} />
              <AccountInfoRow label="Issue date" value={issued.issueDate} />
              {issued.driversLicense && (
                <>
                  <AccountInfoRow
                    label="Licence number"
                    value={issued.driversLicense.licenseNumber}
                  />
                  <AccountInfoRow
                    label="Licence code"
                    value={issued.driversLicense.licenseCode}
                  />
                  <AccountInfoRow
                    label="Restrictions"
                    value={issued.driversLicense.restrictions}
                  />
                  <AccountInfoRow
                    border={false}
                    label="Expires"
                    value={issued.driversLicense.expiryDate}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
