'use client'

import type { FC } from 'react'
import { ClipboardCheck } from 'lucide-react'

import { Form, Text } from '@/components/atoms'
import {
  FormCheckboxField,
  FormSubmitButton,
  FormTextField,
} from '@/components/molecules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contactDetailsSchema, type ContactDetailsFormData } from '@/schemas'

import type { CaptureContactDetailsProps } from './types'

const CONSENT_LABEL =
  'Citizen has provided explicit consent to create a FlashID account and receive an activation code.'

const INITIAL_VALUES: ContactDetailsFormData = {
  contactDetailsConsent: false,
  email: '',
  phone: '',
}

export const CaptureContactDetails: FC<CaptureContactDetailsProps> = ({
  className,
  onSubmitForm,
  onSuccess,
}) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5" />
        <Text variant="h4">Capture Contact Details</Text>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Form<ContactDetailsFormData>
        initialValues={INITIAL_VALUES}
        onSubmitForm={onSubmitForm}
        onSuccess={onSuccess}
        render={() => (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <FormTextField
                label="Phone Number"
                name="phone"
                placeholder="+27..."
              />
              <FormTextField
                label="Email Address"
                name="email"
                placeholder="citizen@example.com"
                type="email"
              />
            </div>
            <FormCheckboxField
              label={CONSENT_LABEL}
              name="contactDetailsConsent"
            />
            <FormSubmitButton className="w-full">
              Create Pending FlashID Account
            </FormSubmitButton>
          </>
        )}
        validationSchema={contactDetailsSchema}
      />
    </CardContent>
  </Card>
)
