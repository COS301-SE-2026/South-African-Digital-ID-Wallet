'use client'

import {
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'

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
              <h2 className="text-base font-extrabold text-danger-red">
                Suspicious activity detected
              </h2>

              <span className="rounded-full bg-danger-red/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-danger-red">
                High risk
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-text">
              {alert.summary}
            </p>
          </div>

          <AlertTriangle className="hidden h-5 w-5 shrink-0 text-danger-red sm:block" />
        </div>
      </div>
    </section>
  )
}