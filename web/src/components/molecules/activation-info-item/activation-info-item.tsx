import { LucideIcon } from 'lucide-react'
import { ActivationInfoItemProps } from './types'

export function ActivationInfoItem({
  icon: Icon,
  title,
  description,
}: ActivationInfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>

      <div>
        <h3 className="font-semibold text-deep-green">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
