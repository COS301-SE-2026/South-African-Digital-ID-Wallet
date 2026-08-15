import { AxiosError, type AxiosResponse } from 'axios'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { loginService, type LoginResponse } from '@/services/login-service'
import { useAuthStore } from '@/stores/auth-store'

import { LoginForm } from '../login-form'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}))

jest.mock('@/services/login-service/login-service', () => ({
  __esModule: true,
  default: { login: jest.fn(), logout: jest.fn() },
}))

const loginMock = loginService.login as jest.Mock

const session: LoginResponse = {
  userId: 'u-1',
  role: 'citizen',
  names: 'Thabo',
  surname: 'Mokoena',
  token: 'jwt-token',
  expiresAt: '2026-08-16T10:00:00Z',
}

const pristineAuth = useAuthStore.getState()

const fillIn = async (email: string, password: string) => {
  await fireEvent.changeText(screen.getByLabelText('Email'), email)
  await fireEvent.changeText(screen.getByLabelText('Password'), password)
}

describe('<LoginForm/>', () => {
  beforeEach(() => {
    useAuthStore.setState(pristineAuth, true)
    jest.clearAllMocks()
  })
  it('Should keep submit disabled until the form is valid', async () => {
    await render(<LoginForm />)
    const submit = () => screen.getByTestId('login-submit')
    expect(submit().props.accessibilityState.disabled).toBe(true)
    await fillIn('thabo@flashid.co.za', 'hunter2')
    await waitFor(() =>
      expect(submit().props.accessibilityState.disabled).toBe(false)
    )
  })
  it('Should surface the validation message for malformed email', async () => {
    await render(<LoginForm />)
    await fireEvent.changeText(screen.getByLabelText('Email'), 'not-an-email')
    await fireEvent(screen.getByLabelText('Email'), 'blur')
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy()
    expect(loginMock).not.toHaveBeenCalled()
  })
  it('Should sign the user in and nav home on success', async () => {
    loginMock.mockResolvedValue(session)
    await render(<LoginForm />)
    await fillIn('thabo@flashid.co.za', 'hunter2')
    await waitFor(() =>
      expect(
        screen.getByTestId('login-submit').props.accessibilityState.disabled
      ).toBe(false)
    )
    await fireEvent.press(screen.getByTestId('login-submit'))
    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith({
        email: 'thabo@flashid.co.za',
        password: 'hunter2',
      })
    )
    await waitFor(() =>
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    )
    expect(useAuthStore.getState().token).toBe('jwt-token')
    expect(mockReplace).toHaveBeenCalledWith('/home')
  })
  it('Should show the resolved error and stays put then login fails', async () => {
    loginMock.mockRejectedValue(
      new AxiosError('unauthorised', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
        data: {},
      } as AxiosResponse)
    )
    await render(<LoginForm />)
    await fillIn('thabo@flashid.co.za', 'wrong-password')
    await waitFor(() =>
      expect(
        screen.getByTestId('login-submit').props.accessibilityState.disabled
      ).toBe(false)
    )
    await fireEvent.press(screen.getByTestId('login-submit'))
    expect(await screen.findByText('Incorrect email or password.')).toBeTruthy()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(mockReplace).not.toHaveBeenCalled()
  })
  it('Should delegate the secondary actions to its props', async () => {
    const onForgotPassword = jest.fn()
    const onRegister = jest.fn()
    await render(
      <LoginForm onForgotPassword={onForgotPassword} onRegister={onRegister} />
    )
    await fireEvent.press(screen.getByText('Forgot password?'))
    await fireEvent.press(screen.getByText('Sign up'))
    expect(onForgotPassword).toHaveBeenCalledTimes(1)
    expect(onRegister).toHaveBeenCalledTimes(1)
  })
})
