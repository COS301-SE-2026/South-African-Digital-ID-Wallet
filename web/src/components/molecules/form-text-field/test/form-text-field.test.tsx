import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'

import { FormTextField } from '../form-text-field'

type TestValues = { email: string }

const ERROR_MESSAGE = 'Enter a valid email address.'

const renderField = ({
  initialErrors,
  initialTouched,
  initialValues = { email: '' },
}: {
  initialErrors?: { email?: string }
  initialTouched?: { email?: boolean }
  initialValues?: TestValues
} = {}) =>
  render(
    <Formik<TestValues>
      initialErrors={initialErrors}
      initialTouched={initialTouched}
      initialValues={initialValues}
      onSubmit={jest.fn()}
    >
      <FormTextField label="Email address" name="email" />
    </Formik>
  )

describe('FormTextField', () => {
  it('Should render the label and the value held in the Formik state', () => {
    renderField({ initialValues: { email: 'citizen@example.com' } })
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'citizen@example.com'
    )
  })

  it('Should write changes back into the Formik state', async () => {
    renderField()
    const input = screen.getByLabelText('Email address')
    await userEvent.type(input, 'new@example.com')
    expect(input).toHaveValue('new@example.com')
  })

  it('Should hide the error until the field has been touched', () => {
    renderField({ initialErrors: { email: ERROR_MESSAGE } })
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
  })

  it('Should show the error once the field has been touched', () => {
    renderField({
      initialErrors: { email: ERROR_MESSAGE },
      initialTouched: { email: true },
    })
    expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('Should forward native input props through to the field', () => {
    render(
      <Formik<TestValues> initialValues={{ email: '' }} onSubmit={jest.fn()}>
        <FormTextField
          label="Email address"
          name="email"
          placeholder="citizen@example.com"
          type="email"
        />
      </Formik>
    )
    const input = screen.getByLabelText('Email address')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'citizen@example.com')
  })
})
