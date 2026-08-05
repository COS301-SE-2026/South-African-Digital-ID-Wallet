'use client'

import { Formik, type FormikErrors, type FormikHelpers } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { cn } from '@/lib/utils'

import type { FormProps } from './types'

export const Form = <T extends Record<string, unknown>>({
  className,
  initialValues,
  onFailure,
  onSubmitForm,
  onSuccess,
  render,
  validationSchema,
  ...rest
}: FormProps<T>) => {
  const _handleFormSubmitError = (
    error: unknown,
    actions: FormikHelpers<T>
  ) => {
    const apiErrors = (error as { errors?: FormikErrors<T> })?.errors
    if (apiErrors) {
      actions.setErrors(apiErrors)
    }
  }
}
