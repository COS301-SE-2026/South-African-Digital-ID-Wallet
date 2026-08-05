'use client'

import { useFormikContext } from 'formik'

import { Button } from '@/components/atoms'

import type { FormSubmitButtonProps } from './types'

export const FormSubmitButton = ({
  children,
  className,
}: FormSubmitButtonProps) => {
  const { isSubmitting, isValid } = useFormikContext()

  return (
    <Button
      className={className}
      disabled={isSubmitting || !isValid}
      isLoading={isSubmitting}
      type="submit"
      variant="primary"
    >
      {children}
    </Button>
  )
}
