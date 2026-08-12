import type { ContactDetailsFormData } from '@/schemas'

export type CaptureContactDetailsProps = {
  className?: string
  onSubmitForm: (formData: ContactDetailsFormData) => Promise<unknown>
  onSuccess?: () => void
}
