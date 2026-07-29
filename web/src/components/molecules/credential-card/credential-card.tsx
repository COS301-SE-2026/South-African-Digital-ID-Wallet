import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusPill } from '@/components/atoms'
import { Text } from '@/components/atoms'
import type { CredentialCardProps } from './types'

export function CredentialCard({
  icon: Icon,
  title,
  description,
  available,
  activated,
  onToggle,
}: Readonly<CredentialCardProps>) {
  return (
    <Card className="gap-4 p-6">
      <div className="flex h-full flex-col">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-green/10 text-primary-green">
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <Text variant="sub-md" className="font-bold text-text-primary">
                {title}
              </Text>
              <StatusPill intent={available ? 'active' : 'inactive'}>
                {available ? 'Available' : 'Unavailable'}
              </StatusPill>
            </div>
            <Text variant="sub-sm" className="mt-1 text-muted-foreground">
              {description}
            </Text>
          </div>
        </div>

        <div className="mt-auto">
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-4 py-3">
            <Checkbox
              checked={activated}
              onCheckedChange={(checked) => onToggle(checked === true)}
              disabled={!available}
            />
            <Text variant="sub-sm" className="font-semibold text-text-primary">
              Activate this credential
            </Text>
          </label>
        </div>
      </div>
    </Card>
  )
}
