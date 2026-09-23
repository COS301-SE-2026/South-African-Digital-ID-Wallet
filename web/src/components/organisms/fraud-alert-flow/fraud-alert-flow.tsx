'use client'

import {
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'

import { Text } from '@/components/atoms/text'

import type { FraudAlertFlowProps } from './types'

export function FraudAlertFlow({ alert }: FraudAlertFlowProps) {
  return (
    <section
      aria-label="Security alert"
      className="rounded-[26px] border-2 border-danger-red bg-danger-red/10 p-[2px]"
    >
      <div className="rounded-[24px] bg-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-red text-clean-white">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text
                as="h2"
                variant="h4"
                className="text-danger-red"
              >
                Suspicious activity detected
              </Text>

              <Text
                as="span"
                variant="caption"
                className="rounded-full bg-danger-red/10 px-2.5 py-1 font-bold uppercase tracking-wide text-danger-red"
              >
                High risk
              </Text>
            </div>

            <Text
              as="p"
              variant="sub-sm"
              className="mt-2"
            >
              {alert.summary}
            </Text>
          </div>

          <AlertTriangle className="hidden h-5 w-5 shrink-0 text-danger-red sm:block" />
        </div>
      </div>
    </section>
  )
}