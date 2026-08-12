import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CaptureContactDetails } from '../capture-contact-details'

const fillPhoneAndEmail = async () => {
  await userEvent.type(screen.getByLabelText('Phone Number'), '0612345678')
  await userEvent.type(
    screen.getByLabelText('Email Address'),
    'citizen@example.com'
  )
}

const checkConsent = () =>
  userEvent.click(screen.getByRole('checkbox', { name: /explicit consent/i }))

const submit = () =>
  userEvent.click(
    screen.getByRole('button', { name: 'Create Pending FlashID Account' })
  )

describe('CaptureContactDetails', () => {
  it('Should submit the captured details when everything is valid', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    render(<CaptureContactDetails onSubmitForm={onSubmitForm} />)
    await fillPhoneAndEmail()
    await checkConsent()
    await submit()
    await waitFor(() =>
      expect(onSubmitForm).toHaveBeenCalledWith(
        {
          contactDetailsConsent: true,
          email: 'citizen@example.com',
          phone: '0612345678',
        },
        expect.anything()
      )
    )
  })
  it('Should reject a number that not a South African number', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    render(<CaptureContactDetails onSubmitForm={onSubmitForm} />)
    await userEvent.type(screen.getByLabelText('Phone Number'), '0123456789')
    await userEvent.type(
      screen.getByLabelText('Email Address'),
      'citizen@example.com'
    )
    await checkConsent()
    await submit()
    expect(
      await screen.findByText(/valid South African mobile number/i)
    ).toBeInTheDocument()
    expect(onSubmitForm).not.toHaveBeenCalled()
  })
  it('Should reject a malformed email address', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    render(<CaptureContactDetails onSubmitForm={onSubmitForm} />)
    await userEvent.type(screen.getByLabelText('Phone Number'), '0612345678')
    await userEvent.type(screen.getByLabelText('Email Address'), 'not-an-email')
    await checkConsent()
    await submit()
    expect(
      await screen.findByText('Enter a valid email address.')
    ).toBeInTheDocument()
    expect(onSubmitForm).not.toHaveBeenCalled()
  })
  it('Should require consent before submitting', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    render(<CaptureContactDetails onSubmitForm={onSubmitForm} />)
    await fillPhoneAndEmail()
    await submit()
    expect(await screen.findByText(/consent is required/i)).toBeInTheDocument()
    expect(onSubmitForm).not.toHaveBeenCalled()
  })
  it('Should surface an API field error under the matching input', async () => {
    const onSubmitForm = jest
      .fn()
      .mockRejectedValue({ errors: { email: 'Already registered' } })
    render(<CaptureContactDetails onSubmitForm={onSubmitForm} />)
    await fillPhoneAndEmail()
    await checkConsent()
    await submit()
    expect(await screen.findByText('Already registered')).toBeInTheDocument()
  })
  it('Should call onSuccess after a successful submission', async () => {
    const onSubmitForm = jest.fn().mockResolvedValue(undefined)
    const onSuccess = jest.fn()
    render(
      <CaptureContactDetails
        onSubmitForm={onSubmitForm}
        onSuccess={onSuccess}
      />
    )
    await fillPhoneAndEmail()
    await checkConsent()
    await submit()
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })
})
