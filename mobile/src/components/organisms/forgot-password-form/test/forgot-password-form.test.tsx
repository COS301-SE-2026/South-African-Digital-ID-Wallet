import { AxiosError, type AxiosResponse } from 'axios'
import { Alert } from 'react-native'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { loginService } from '@/services/login-service'

import { ForgotPasswordForm } from '../forgot-password-form'

jest.mock('@/services/login-service/login-service', () => ({
  __esModule: true,
  default: { forgotPassword: jest.fn(), resetPassword: jest.fn() },
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}))

const forgotMock = loginService.forgotPassword as jest.Mock
const resetMock = loginService.resetPassword as jest.Mock

const renderForm = (
  props: Partial<Parameters<typeof ForgotPasswordForm>[0]> = {}
) =>
  render(
    <ForgotPasswordForm
      onBackToLogin={jest.fn()}
      onComplete={jest.fn()}
      {...props}
    />
  )

const waitUntilEnabled = (testID: string) =>
  waitFor(() =>
    expect(screen.getByTestId(testID).props.accessibilityState.disabled).toBe(
      false
    )
  )

const requestCode = async (email = 'thabo@flashid.co.za') => {
  await fireEvent.changeText(screen.getByLabelText('Email'), email)
  await waitUntilEnabled('forgot-password-submit')
  await fireEvent.press(screen.getByTestId('forgot-password-submit'))
  await screen.findByTestId('forgot-password-reset')
}

const fillReset = async (otp: string, password: string, confirm = password) => {
  await fireEvent.changeText(screen.getByLabelText('Reset code'), otp)
  await fireEvent.changeText(screen.getByLabelText('New password'), password)
  await fireEvent.changeText(
    screen.getByLabelText('Confirm new password'),
    confirm
  )
}

describe('<ForgotPasswordForm/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    forgotMock.mockResolvedValue(undefined)
    resetMock.mockResolvedValue(undefined)
  })
  it('Should request a code and move to the reset step', async () => {
    await renderForm()
    await requestCode()
    expect(forgotMock).toHaveBeenCalledWith('thabo@flashid.co.za')
    expect(screen.getByText('Resend in 60s')).toBeTruthy()
  })
  it('Should stay on the email step when the request fails', async () => {
    forgotMock.mockRejectedValue(new AxiosError('offline'))
    await renderForm()
    await fireEvent.changeText(
      screen.getByLabelText('Email'),
      'thabo@flashid.co.za'
    )
    await waitUntilEnabled('forgot-password-submit')
    await fireEvent.press(screen.getByTestId('forgot-password-submit'))
    expect(
      await screen.findByText(
        'Could not reach the server. Check your connection.'
      )
    ).toBeTruthy()
    expect(screen.getByTestId('forgot-password-request')).toBeTruthy()
  })
  it('Should reset the password and send the user back to log in', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const onComplete = jest.fn()
    await renderForm({ onComplete })
    await requestCode()
    await fillReset('123456', 'NewPassw0rd!')
    await waitUntilEnabled('reset-password-submit')
    await fireEvent.press(screen.getByTestId('reset-password-submit'))
    await waitFor(() =>
      expect(resetMock).toHaveBeenCalledWith({
        email: 'thabo@flashid.co.za',
        otp: '123456',
        newPassword: 'NewPassw0rd!',
        confirmPassword: 'NewPassw0rd!',
      })
    )
    const buttons = alertSpy.mock.calls[0][2]
    buttons?.[0].onPress?.()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
  it('Should show the backend message when the code is wrong', async () => {
    resetMock.mockRejectedValue(
      new AxiosError('bad request', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: { error: 'Invalid or incorrect OTP.' },
      } as AxiosResponse)
    )
    await renderForm()
    await requestCode()
    await fillReset('000000', 'NewPassw0rd!')
    await waitUntilEnabled('reset-password-submit')
    await fireEvent.press(screen.getByTestId('reset-password-submit'))
    expect(await screen.findByText('Invalid or incorrect OTP.')).toBeTruthy()
  })
  it('Should keep submit disabled while the passwords do not match', async () => {
    await renderForm()
    await requestCode()
    await fillReset('123456', 'NewPassw0rd!', 'Different1!')
    await fireEvent(screen.getByLabelText('Confirm new password'), 'blur')
    expect(await screen.findByText('Passwords do not match.')).toBeTruthy()
    expect(resetMock).not.toHaveBeenCalled()
  })
  it('Should go back to the email step from Use a different email', async () => {
    await renderForm()
    await requestCode()
    await fireEvent.press(screen.getByText('Use a different email'))
    expect(await screen.findByTestId('forgot-password-request')).toBeTruthy()
  })
  it('Should delegate Back to login to its props', async () => {
    const onBackToLogin = jest.fn()
    await renderForm({ onBackToLogin })
    await fireEvent.press(screen.getByText('Back to login'))
    expect(onBackToLogin).toHaveBeenCalledTimes(1)
  })
})
