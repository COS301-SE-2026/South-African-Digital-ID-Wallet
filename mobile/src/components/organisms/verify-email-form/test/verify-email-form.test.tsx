import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { VerifyEmailForm } from '../verify-email-form'

const base = {
  email: 'thabo@flashid.co.za',
  onCancel: jest.fn(),
  onResend: jest.fn().mockResolvedValue(undefined),
  onVerify: jest.fn().mockResolvedValue(undefined),
}

describe('<VerifyEmailForm/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should name the address the code went to', async () => {
    await render(<VerifyEmailForm {...base} />)
    expect(screen.getByText(/thabo@flashid\.co\.za/)).toBeTruthy()
  })
  it('Should keep submit disabled until a 6-digit code is entered', async () => {
    await render(<VerifyEmailForm {...base} />)
    expect(
      screen.getByTestId('verify-email-submit').props.accessibilityState
        .disabled
    ).toBe(true)
    await fireEvent.changeText(
      screen.getByLabelText('Verification code'),
      '123456'
    )
    await waitFor(() =>
      expect(
        screen.getByTestId('verify-email-submit').props.accessibilityState
          .disabled
      ).toBe(false)
    )
  })
  it('Should reject a short code', async () => {
    await render(<VerifyEmailForm {...base} />)
    await fireEvent.changeText(
      screen.getByLabelText('Verification code'),
      '123'
    )
    await fireEvent(screen.getByLabelText('Verification code'), 'blur')
    expect(
      await screen.findByText('Enter the 6-digit code from your email.')
    ).toBeTruthy()
  })
  it('Should submit the entered code', async () => {
    const onVerify = jest.fn().mockResolvedValue(undefined)
    await render(<VerifyEmailForm {...base} onVerify={onVerify} />)
    await fireEvent.changeText(
      screen.getByLabelText('Verification code'),
      '123456'
    )
    await waitFor(() =>
      expect(
        screen.getByTestId('verify-email-submit').props.accessibilityState
          .disabled
      ).toBe(false)
    )
    await fireEvent.press(screen.getByTestId('verify-email-submit'))
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('123456'))
  })
  it('Should surface a submit error', async () => {
    await render(
      <VerifyEmailForm {...base} submitError="That code is wrong." />
    )
    expect(screen.getByText('That code is wrong.')).toBeTruthy()
  })
  it('Should start a cooldown after resending', async () => {
    const onResend = jest.fn().mockResolvedValue(undefined)
    await render(<VerifyEmailForm {...base} onResend={onResend} />)
    await fireEvent.press(screen.getByText('Resend code'))
    await waitFor(() => expect(onResend).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/Resend in \d+s/)).toBeTruthy()
  })
  it('Should cancel back to the caller', async () => {
    const onCancel = jest.fn()
    await render(<VerifyEmailForm {...base} onCancel={onCancel} />)
    await fireEvent.press(screen.getByText('Use a different email'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
