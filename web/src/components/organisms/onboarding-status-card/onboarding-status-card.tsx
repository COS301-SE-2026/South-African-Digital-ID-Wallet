'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'
import { StatusItem } from '@/components/atoms'
import { OnboardingStatusCardProps } from './types'

export const OnboardingStatusCard = ({
  record,
  idConsent,
  contactDetailsConsent,
  phone,
  email,
  accountCreated,
  activationSent,
}: OnboardingStatusCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Onboarding Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <StatusItem label="Identity record retrieved" done={!!record} />
        <StatusItem
          label="Consent captured"
          done={idConsent && contactDetailsConsent}
        />
        <StatusItem
          label="Contact details captured"
          done={!!phone || !!email}
        />
        <StatusItem label="Pending account created" done={accountCreated} />
        <StatusItem label="Activation code sent" done={activationSent} />
      </CardContent>
    </Card>
  )
}
