import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'

import { FormSubmitButton } from '../form-submit-button'

type TestValues = { email: string }

const renderButton = ({
  initialErrors,
  onSubmit = jest.fn(),
}: {
  initialErrors?: { email?: string }
  onSubmit?: jest.Mock
} = {}) =>
  render(
    <Formik<TestValues>
      initialErrors={initialErrors}
      initialValues={{ email: 'citizen@example.com' }}
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FormSubmitButton>Continue</FormSubmitButton>
        </form>
      )}
    </Formik>
  )

describe('FormSubmitButton', () => {
  it('Should render it label and should enable while form is valid', () => {
    renderButton()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('Should disable while the form has errors', () => {
    renderButton({ initialErrors: { email: 'Enter a valid email address.' } })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('Should submit the form when clicked', async () => {
    const onSubmit = jest.fn()
    renderButton({ onSubmit })
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })

  it('Should show the loading state and blocks a second submit while loading', async () => {
    const onSubmit = jest.fn(() => new Promise<void>(() => {}))
    renderButton({ onSubmit })
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button')).toBeDisabled())
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
