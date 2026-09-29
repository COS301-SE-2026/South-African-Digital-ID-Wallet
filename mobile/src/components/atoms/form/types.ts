import type { FormikConfig, FormikHelpers, FormikValues } from 'formik'
import type { ReactNode } from 'react'
import type { ZodType } from 'zod'

export type FormProps<T extends FormikValues> = Omit<
  FormikConfig<T>,
  'children' | 'onSubmit' | 'validationSchema'
> & {
  children: ReactNode
  initialValues: T
  onSubmitForm: (values: T, actions: FormikHelpers<T>) => Promise<unknown>
  validationSchema: ZodType<T>
}
