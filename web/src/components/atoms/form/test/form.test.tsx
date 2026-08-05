import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '@/components/atoms'
import { FormSubmitButton, FormTextField } from '@/components/molecules'

const testSchema = z.object({
  email: z.string().trim().email({ error: 'Enter a valid email address.' }),
})

type TestFormData = z.infer<typeof testSchema>

const INITIAL_VALUES: TestFormData = { email: '' }

const renderForm = (
  onSubmitForm: (formData: TestFormData) => Promise<unknown>
) =>
  render(
    <Form<TestFormData>
      initialValues={INITIAL_VALUES}
      onSubmitForm={onSubmitForm}
      render={() => (
        <>
          <FormTextField label="Email address" name="email" />
          <FormSubmitButton>Continue</FormSubmitButton>
        </>
      )}
      validationSchema={testSchema}
    />
  )

describe('Form', () => {
  it('Should submit parsed val when the schema passes', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    renderForm(onSubmitForm)
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'citizen@example.com'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() =>
      expect(onSubmitForm).toHaveBeenCalledWith(
        { email: 'citizen@example.com' },
        expect.anything()
      )
    )
  })

  it('Should block submission and show the schema message when invalid', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    renderForm(onSubmitForm)
    await userEvent.type(screen.getByLabelText('Email address'), 'nope')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByText('Enter a valid email address.')
    ).toBeInTheDocument()
    expect(onSubmitForm).not.toHaveBeenCalled()
  })

  it('Should map API field errors onto matching field', async () => {
    const onSubmitForm = jest
      .fn()
      .mockRejectedValue({ errors: { email: 'Already taken' } })
    renderForm(onSubmitForm)
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'citizen@example.com'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('Already taken')).toBeInTheDocument()
  })

  it('Should clear isSubmitting after the reject submission', async () => {
    const onSubmitForm = jest.fn().mockRejectedValue(new Error('network'))
    renderForm(onSubmitForm)
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'citizen@example.com'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    )
  })
})
