import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/atoms'
import type { ScanResultCardProps } from './types'

const PHOTO_FIELD_LABELS = new Set(['Photo', 'Photograph'])

export const ScanResultCard = ({
  credentialType,
  disclosedFields,
}: Readonly<ScanResultCardProps>) => {
  const fields = Object.entries(disclosedFields)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Text variant="sub-lg">Verified credentials</Text>
        <Badge variant="secondary">{credentialType}</Badge>
      </div>

      <Card className="p-0">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
          >
            <Text variant="sub-sm" className="text-muted-foreground">
              {label}
            </Text>
            {PHOTO_FIELD_LABELS.has(label) && value ? (
              <img
                src={value}
                alt={label}
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <Text variant="sub-sm" className="font-medium">
                {value}
              </Text>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}
