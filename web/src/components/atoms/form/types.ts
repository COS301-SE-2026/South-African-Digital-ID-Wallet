import { FormikConfig, FormikHelpers, FormikProps } from 'formik'
import type { ReactNode } from 'react'
import type { ZodType } from 'zod'

export type FormProps<T extends Record<string, unknown>> = Omit<
  FormikConfig<T>,
  'children' | 'component' | 'onSubmit' | 'render' | 'validationSchema'
> & {
  className?: string
  initialValues: T
  onFailure?: (error: unknown, actions: FormikHelpers<T>) => void
  onSubmitForm: (formData: T, actions: FormikHelpers<T>) => Promise<unknown>
  onSuccess?: (actions: FormikHelpers<T>) => void
  render: (props: FormikProps<T>) => ReactNode
  validationSchema: ZodType<T>
}
