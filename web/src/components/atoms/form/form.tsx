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

  const _handleSubmission = (formData: T, actions: FormikHelpers<T>) => {
    onSubmitForm(formData, actions)
      .then(() => {
        if (onSuccess) {
          onSuccess(actions)
        }
      })
      .catch((error) => {
        if (onFailure) {
          onFailure(error, actions)
        } else {
          _handleFormSubmitError(error, actions)
        }
      })
      .finally(() => actions.setSubmitting(false))
  }

  return (
    <Formik<T>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={_handleSubmission}
      validateOnBlur
      validateOnChange
      validationSchema={toFormikValidationSchema(validationSchema)}
      {...rest}
    >
      {(formikProps) => (
        <form
          className={cn('flex flex-col gap-y-6', className)}
          noValidate
          onSubmit={formikProps.handleSubmit}
        >
          {render(formikProps)}
        </form>
      )}
    </Formik>
  )
}
