import { Formik, type FormikValues } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import type { FormProps } from './types'

export const Form = <T extends FormikValues>({
  children,
  initialValues,
  onSubmitForm,
  validationSchema,
  ...rest
}: FormProps<T>) => (
  <Formik<T>
    initialValues={initialValues}
    onSubmit={(values, actions) =>
      onSubmitForm(values, actions).finally(() => actions.setSubmitting(false))
    }
    validateOnBlur
    validationSchema={toFormikValidationSchema(validationSchema)}
    {...rest}
  >
    {children}
  </Formik>
)
