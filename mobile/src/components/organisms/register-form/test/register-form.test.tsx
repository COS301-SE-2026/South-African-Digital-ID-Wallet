import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'
import { Alert } from 'react-native'

import { registerService } from '@/services/register-service'

import { RegisterForm } from '../register-form'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: mockReplace }),
}))
jest.mock('@/services/register-service/register-service', () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    resendOtp: jest.fn(),
    verifyEmail: jest.fn(),
  },
}))

const registerMock = registerService.register as jest.Mock
const verifyMock = registerService.verifyEmail as jest.Mock
const resendMock = registerService.resendOtp as jest.Mock

const EMAIL = 'thabo@flashid.co.za'
const PASSWORD = 'Str0ng!Pass1'

const fillIn = async (password = PASSWORD, confirm = PASSWORD) => {
  await fireEvent.changeText(screen.getByLabelText('Email'), EMAIL)
  await fireEvent.changeText(screen.getByLabelText('Password'), password)
  await fireEvent.changeText(screen.getByLabelText('Verify password'), confirm)
}

const submitEnabled = () =>
  screen.getByTestId('register-submit').props.accessibilityState.disabled ===
  false

describe('<RegisterForm/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should keep submit disabled until the form is valid', async () => {
    await render(<RegisterForm />)
    expect(
      screen.getByTestId('register-submit').props.accessibilityState.disabled
    ).toBe(true)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
  })
  it('Should show the password checklist once typing starts', async () => {
    await render(<RegisterForm />)
    await fireEvent.changeText(screen.getByLabelText('Password'), 'short')
    expect(await screen.findByTestId('password-requirements')).toBeTruthy()
  })
  it('Should hide the checklist when the password is empty', async () => {
    await render(<RegisterForm />)
    expect(screen.queryByTestId('password-requirements')).toBeNull()
  })
  it('Should surface a mismatched confirmation', async () => {
    await render(<RegisterForm />)
    await fillIn(PASSWORD, 'Different1!')
    await fireEvent(screen.getByLabelText('Verify password'), 'blur')
    expect(await screen.findByText('Passwords do not match.')).toBeTruthy()
    expect(registerMock).not.toHaveBeenCalled()
  })
  it('Should move to the verification step on success', async () => {
    registerMock.mockResolvedValue({ userId: 'u-1' })
    await render(<RegisterForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('register-submit'))
    expect(await screen.findByTestId('verify-email-form')).toBeTruthy()
    expect(registerMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: EMAIL, password: PASSWORD })
    )
  })
  it('Should show the resolved error when registration fails', async () => {
    registerMock.mockRejectedValue(new Error('boom'))
    await render(<RegisterForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('register-submit'))
    expect(
      await screen.findByText('Something went wrong. Please try again.')
    ).toBeTruthy()
    expect(screen.queryByTestId('verify-email-form')).toBeNull()
  })
  it('Should verify the emailed code and offer a route to login', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    registerMock.mockResolvedValue({ userId: 'u-1' })
    verifyMock.mockResolvedValue({ ok: true })
    await render(<RegisterForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('register-submit'))
    await screen.findByTestId('verify-email-form')
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
    await waitFor(() =>
      expect(verifyMock).toHaveBeenCalledWith({ email: EMAIL, otp: '123456' })
    )
    await waitFor(() => expect(alertSpy).toHaveBeenCalled())
    const buttons = alertSpy.mock.calls[0][2] as { onPress?: () => void }[]
    buttons[0].onPress?.()
    expect(mockReplace).toHaveBeenCalledWith('/login')
    alertSpy.mockRestore()
  })
  it('Should return to the form from the verification step', async () => {
    registerMock.mockResolvedValue({ userId: 'u-1' })
    await render(<RegisterForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('register-submit'))
    await screen.findByTestId('verify-email-form')
    await fireEvent.press(screen.getByText('Use a different email'))
    expect(await screen.findByTestId('register-submit')).toBeTruthy()
  })
  it('Should resend the code from the verification step', async () => {
    registerMock.mockResolvedValue({ userId: 'u-1' })
    resendMock.mockResolvedValue({ ok: true })
    await render(<RegisterForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('register-submit'))
    await screen.findByTestId('verify-email-form')
    await fireEvent.press(screen.getByText('Resend code'))
    await waitFor(() => expect(resendMock).toHaveBeenCalledWith(EMAIL))
  })
  it('Should delegate the sign-in action to its props', async () => {
    const onSignIn = jest.fn()
    await render(<RegisterForm onSignIn={onSignIn} />)
    await fireEvent.press(screen.getByText('Log in'))
    expect(onSignIn).toHaveBeenCalledTimes(1)
  })
})
