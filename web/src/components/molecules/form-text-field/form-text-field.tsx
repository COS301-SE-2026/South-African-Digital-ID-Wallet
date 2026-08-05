'use client'

import { useField } from 'formik'

import { TextField } from '@/components/molecules'

import type { FormTextFieldProps } from './types'

export const FormTextField = ({ name, ...rest }: FormTextFieldProps) => {
  const [field, meta] = useField<string>(name)

  return (
    <TextField
      {...rest}
      {...field}
      error={meta.touched ? meta.error : undefined}
    />
  )
}
