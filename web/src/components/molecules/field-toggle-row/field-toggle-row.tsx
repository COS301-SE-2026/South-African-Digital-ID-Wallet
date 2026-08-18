'use client'

import * as React from 'react'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/atoms'
import type { FieldToggleRowProps } from './types'

export const FieldToggleRow = ({
  label,
  checked,
  onCheckedChange,
  locked = false,
}: Readonly<FieldToggleRowProps>) => {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <Text variant="sub-sm" className="text-black">
        {label}
      </Text>
      <Switch
        checked={checked}
        disabled={locked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  )
}
