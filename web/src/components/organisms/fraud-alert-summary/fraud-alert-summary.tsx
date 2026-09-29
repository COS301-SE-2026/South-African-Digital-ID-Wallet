import { ShieldAlert } from 'lucide-react'
import { Text } from '@/components/atoms/text'
import type { FraudAlertSummaryProps } from './types'

export function FraudAlertSummary({ alert }: FraudAlertSummaryProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-danger-red/20 bg-danger-red/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-red text-clean-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <Text
            as="p"
            variant="sub-sm"
            className="font-bold text-danger-red"
          >
            {alert.title}
          </Text>
          <Text
            as="p"
            variant="sub-sm"
            className="mt-1 text-text-primary"
          >
            {alert.summary}
          </Text>
        </div>
      </div>
    </div>
  )
}