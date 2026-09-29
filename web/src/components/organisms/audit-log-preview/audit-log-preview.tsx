'use client'

import { Text } from '@/components/atoms'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AuditLogPreviewProps } from './types'

const DEFAULT_ACTION = 'Citizen onboarding initiated'
const DEFAULT_EMPTY_MESSAGE =
  'Audit log will appear once a pending FlashID account is created.'
const DEFAULT_STATUS = 'Pending activation'

export const AuditLogPreview = ({
  action = DEFAULT_ACTION,
  className,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  recordName,
  accountCreated,
  status = DEFAULT_STATUS,
}: AuditLogPreviewProps) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>
        <Text variant="h4">Audit Log Preview</Text>
      </CardTitle>
    </CardHeader>

    <CardContent>
      <div className="rounded-xl border bg-muted/40 p-4">
        {accountCreated ? (
          <div className="flex flex-col gap-2">
            <Text variant="sub-sm">Action: {action}</Text>
            <Text variant="sub-sm">Actor: Home Affairs Official</Text>
            <Text variant="sub-sm">Citizen: {recordName}</Text>
            <Text variant="sub-sm">Status: {status}</Text>
            <Text variant="sub-sm">{new Date().toLocaleString()}</Text>
          </div>
        ) : (
          <Text variant="sub-sm">{emptyMessage}</Text>
        )}
      </div>
    </CardContent>
  </Card>
)
