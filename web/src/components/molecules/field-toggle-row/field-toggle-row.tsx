'use client'

import * as React from 'react'
import { Lock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Text } from '@/components/atoms'
import type { FieldToggleRowProps } from './types'

export const FieldToggleRow = ({
  label,
  checked,
  onCheckedChange,
  locked = false,
}: Readonly<FieldToggleRowProps>) => {
  return (
    <div className="flex items-center justify-between py-2">
      <Text variant="sub-sm">{label}</Text>
      <div className="flex items-center gap-2">
        {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
        <Checkbox
          checked={checked}
          disabled={locked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-label={label}
        />
      </div>
    </div>
  )
}
