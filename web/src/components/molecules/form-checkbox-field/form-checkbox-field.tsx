'use client'

import { useField } from 'formik'
import { useId } from 'react'

import { Text } from '@/components/atoms'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import type { FormCheckboxFieldProps } from './types'

export const FormCheckboxField = ({
  className,
  id,
  label,
  name,
}: FormCheckboxFieldProps) => {
  const reactId = useId()
  const checkboxId = id ?? reactId
  const [field, meta, helpers] = useField<boolean>(name)
  const error = meta.touched ? meta.error : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-start gap-3 rounded-xl border p-4">
        <Checkbox
          aria-invalid={Boolean(error) || undefined}
          checked={field.value}
          className="mt-1"
          id={checkboxId}
          name={name}
          onBlur={() => helpers.setTouched(true)}
          onCheckedChange={(checked) => helpers.setValue(checked === true)}
        />
        <Text as="label" htmlFor={checkboxId} variant="sub-sm">
          {label}
        </Text>
      </div>
      {error && (
        <Text className="text-danger-red" variant="caption">
          {error}
        </Text>
      )}
    </div>
  )
}
