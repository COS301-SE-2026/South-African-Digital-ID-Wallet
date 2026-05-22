'use client'

import { CheckCircle2 } from 'lucide-react'
import type { StatusItemProps } from './types'

export const StatusItem = ({ label, done }: Readonly<StatusItemProps>) => {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={`h-4 w-4 ${done ? 'text-success-green' : 'text-muted-text'}`}
      />

      <span
        className={`text-sm ${
          done ? 'font-semibold text-text-primary' : 'text-muted-text'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
