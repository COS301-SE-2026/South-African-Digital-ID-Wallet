import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'
import { Alert } from 'react-native'

import { PasswordForm } from '../password-form'

const mockUpdatePassword = jest.fn()
const mockSignOut = jest.fn()

jest.mock('@/hooks', () => ({
  useSignOut: () => mockSignOut,
  useUpdatePassword: () => ({ updatePassword: mockUpdatePassword }),
}))

const OLD = 'Old1!Passw0rd'
const NEW = 'New1!Passw0rd'

// PasswordForm's TextFields render a visible `label` but pass no
// `accessibilityLabel`, so there is no accessible name to query by. The three
// inputs are addressed by display value instead.
const emptyFields = () => screen.getAllByDisplayValue('')

const fillIn = async (confirm = NEW) => {
  await fireEvent.changeText(emptyFields()[0], OLD)
  await fireEvent.changeText(emptyFields()[0], NEW)
  await fireEvent.changeText(emptyFields()[0], confirm)
}

const submitEnabled = () =>
  screen.getByTestId('password-submit').props.accessibilityState.disabled ===
  false

describe('<PasswordForm/>', () => {
  let alertSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })
  afterEach(() => alertSpy.mockRestore())

  it('Should render all three password fields', async () => {
    await render(<PasswordForm />)
    expect(screen.getByText('Current password')).toBeTruthy()
    expect(screen.getByText('New password')).toBeTruthy()
    expect(screen.getByText('Confirm new password')).toBeTruthy()
    expect(emptyFields()).toHaveLength(3)
  })
  it('Should keep submit disabled until the form is valid', async () => {
    await render(<PasswordForm />)
    expect(
      screen.getByTestId('password-submit').props.accessibilityState.disabled
    ).toBe(true)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
  })
  it('Should reject a mismatched confirmation', async () => {
    await render(<PasswordForm />)
    await fillIn('Different1!')
    await fireEvent(screen.getByDisplayValue('Different1!'), 'blur')
    expect(await screen.findByText('Passwords do not match.')).toBeTruthy()
  })
  it('Should reject a short new password', async () => {
    await render(<PasswordForm />)
    await fireEvent.changeText(emptyFields()[1], 'short')
    await fireEvent(screen.getByDisplayValue('short'), 'blur')
    expect(await screen.findByText('Use at least 8 characters.')).toBeTruthy()
  })
  it('Should update the password then sign the user out', async () => {
    mockUpdatePassword.mockResolvedValue({ ok: true })
    await render(<PasswordForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('password-submit'))
    await waitFor(() =>
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        confirmPassword: NEW,
        currentPassword: OLD,
        newPassword: NEW,
      })
    )
    await waitFor(() => expect(alertSpy).toHaveBeenCalled())
    const buttons = alertSpy.mock.calls[0][2] as { onPress?: () => void }[]
    buttons[0].onPress?.()
    expect(mockSignOut).toHaveBeenCalled()
  })
  it('Should surface the resolved error on failure', async () => {
    mockUpdatePassword.mockRejectedValue(new Error('boom'))
    await render(<PasswordForm />)
    await fillIn()
    await waitFor(() => expect(submitEnabled()).toBe(true))
    await fireEvent.press(screen.getByTestId('password-submit'))
    expect(
      await screen.findByText(
        'Could not update your password. Please try again.'
      )
    ).toBeTruthy()
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
