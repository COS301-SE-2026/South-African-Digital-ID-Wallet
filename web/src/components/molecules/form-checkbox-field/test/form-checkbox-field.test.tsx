import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'

import { FormCheckboxField } from '../form-checkbox-field'

type TestValues = { consent: boolean }

const LABEL = 'Citizen has provided explicit consent.'
const ERROR_MESSAGE = 'Citizen consent is required.'

const renderField = ({
  initialErrors,
  initialTouched,
  initialValues = { consent: false },
}: {
  initialErrors?: { consent?: string }
  initialTouched?: { consent?: boolean }
  initialValues?: TestValues
} = {}) =>
  render(
    <Formik<TestValues>
      initialErrors={initialErrors}
      initialTouched={initialTouched}
      initialValues={initialValues}
      onSubmit={jest.fn()}
    >
      <FormCheckboxField label={LABEL} name="consent" />
    </Formik>
  )

describe('FormCheckboxField', () => {
  it('Should render the label and start from the formik value', () => {
    renderField()
    expect(screen.getByRole('checkbox', { name: LABEL })).not.toBeChecked()
  })
  it('Should reflect a pre-checked Formik value', () => {
    renderField({ initialValues: { consent: true } })
    expect(screen.getByRole('checkbox', { name: LABEL })).toBeChecked()
  })
  it('Should write the toggle back into formik state', async () => {
    renderField()
    const checkbox = screen.getByRole('checkbox', { name: LABEL })
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
  it('Should hide the error until the field hase been touched', () => {
    renderField({ initialErrors: { consent: ERROR_MESSAGE } })
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
  })
  it('Should show the error and marks the input valid once touched', () => {
    renderField({
      initialErrors: { consent: ERROR_MESSAGE },
      initialTouched: { consent: true },
    })
    expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: LABEL })).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})
