import { LucideIcon } from 'lucide-react'
import { ActivationInfoItemProps } from './types'

export function ActivationInfoItem({
  icon: Icon,
  title,
  description,
}: ActivationInfoItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-18 shrink-0 items-center justify-center rounded-sm bg-primary-green/10 text-primary-green">
        <Icon className="size-9" aria-hidden="true" />
      </div>

      <div className="w-60">
        <h3 className="font-bold text-primary-green">{title}</h3>

        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
