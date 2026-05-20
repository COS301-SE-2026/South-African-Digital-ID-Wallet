import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterInstitutionForm } from '../register-institution-form'

describe('RegisterInstitutionForm', () => {
  it('renders the form heading', () => {
    render(<RegisterInstitutionForm />)
    expect(
      screen.getByRole('heading', { name: /register institution/i })
    ).toBeInTheDocument()
  })

  it('renders all field labels', () => {
    render(<RegisterInstitutionForm />)
    expect(screen.getByLabelText(/institution name/i)).toBeInTheDocument()
    expect(screen.getByText(/institution type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/verification number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/admin id/i)).toBeInTheDocument()
  })

  it('renders the Register submit button', () => {
    render(<RegisterInstitutionForm />)
    const button = screen.getByRole('button', { name: /register/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('allows typing in text fields', async () => {
    const user = userEvent.setup()
    render(<RegisterInstitutionForm />)
    await user.type(
      screen.getByLabelText(/institution name/i),
      'Test Institution'
    )
    await user.type(screen.getByLabelText(/verification number/i), '12345')
    await user.type(screen.getByLabelText(/admin id/i), 'ADM001')
    expect(screen.getByLabelText(/institution name/i)).toHaveValue(
      'Test Institution'
    )
    expect(screen.getByLabelText(/verification number/i)).toHaveValue('12345')
    expect(screen.getByLabelText(/admin id/i)).toHaveValue('ADM001')
  })

  it('allows selecting an institution type from the dropdown', async () => {
    const user = userEvent.setup()
    render(<RegisterInstitutionForm />)
    const dropdownInputs = screen.getAllByRole('textbox')
    const dropdownInput = dropdownInputs.find(
      (el) =>
        !el
          .getAttribute('name')
          ?.match(/institutionName|verificationNumber|adminId/)
    )!
    await user.click(dropdownInput)
    await user.click(screen.getByRole('option', { name: /home affairs/i }))
    expect(dropdownInput).toHaveValue('Home Affairs')
  })
})
