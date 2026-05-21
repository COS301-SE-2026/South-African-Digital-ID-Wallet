'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AuditLogPreviewProps } from './types'

export const AuditLogPreview = ({
  recordName,
  accountCreated,
}: AuditLogPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log Preview</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          {accountCreated ? (
            <div className="space-y-2">
              <p>
                <strong>Action:</strong> Citizen onboarding initiated
              </p>
              <p>
                <strong>Actor:</strong> Home Affairs Official
              </p>
              <p>
                <strong>Citizen:</strong> {recordName}
              </p>
              <p>
                <strong>Status:</strong> Pending activation
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Audit log will appear once a pending FlashID account is created.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
