import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RetrieveIdentityRecord } from '../retrieve-identity-record'
import { ComponentProps } from 'react'

const createProps = (overrides = {}) =>
  ({
    idNumber: '',
    setIdNumber: jest.fn(),
    idConsent: false,
    setConsent: jest.fn(),
    record: null,
    retrieveIdentityRecord: jest.fn(),
    errors: {
      idNumber: '',
      idConsent: '',
    },
    setErrors: jest.fn(),
    ...overrides,
  }) as unknown as ComponentProps<typeof RetrieveIdentityRecord>
describe('RetrieveIdentityRecord', () => {
  it('renders the form and disables retrieval until valid', () => {
    render(<RetrieveIdentityRecord {...createProps()} />)
    expect(
      screen.getByPlaceholderText('Enter South African ID number')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Retrieve from Government Registry',
      })
    ).toBeDisabled()
  })
  it('updates ID number and consent', async () => {
    const user = userEvent.setup()
    const props = createProps({
      errors: {
        idNumber: 'Invalid ID number',
        idConsent: 'Consent is required',
      },
    })
    render(<RetrieveIdentityRecord {...props} />)
    await user.type(
      screen.getByPlaceholderText('Enter South African ID number'),
      '9001015009087'
    )
    await user.click(screen.getByRole('checkbox'))
    expect(props.setIdNumber).toHaveBeenCalled()
    expect(props.setConsent).toHaveBeenCalledWith(true)
    expect(props.setErrors).toHaveBeenCalled()
  })
  it('retrieves and displays the identity record', async () => {
    const user = userEvent.setup()
    const props = createProps({
      idNumber: '9001015009087',
      idConsent: true,
      record: {
        status: 'Verified',
        fullName: 'John Doe',
        saId: '9001015009087',
        dateOfBirth: '2000-01-01',
      },
    })
    render(<RetrieveIdentityRecord {...props} />)
    expect(screen.getByText('Verified Identity Record')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('9001015009087')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: 'Retrieve from Government Registry',
      })
    )
    expect(props.retrieveIdentityRecord).toHaveBeenCalled()
  })
})
