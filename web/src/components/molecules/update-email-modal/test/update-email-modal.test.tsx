import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UpdateEmailModal } from '../index'
import { manageUserAccountService } from '@/services/manage-user-account-service'
import { useUser } from '@/context/user-context'

jest.mock('@/services/manage-user-account-service', () => ({
  manageUserAccountService: {
    verifyPassword: jest.fn().mockResolvedValue(undefined),
    requestEmailChange: jest.fn().mockResolvedValue(undefined),
    confirmEmailChange: jest.fn().mockResolvedValue({}),
    resendEmailChangeOtp: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('@/context/user-context', () => ({
  useUser: jest.fn(),
}))

jest.setTimeout(20000)

const mockedUseUser = useUser as jest.Mock
const renderModal = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <UpdateEmailModal open onCloseAction={jest.fn()} />
    </QueryClientProvider>
  )
}

describe('UpdateEmailModal', () => {
  beforeEach(() => {
    mockedUseUser.mockReturnValue({ refresh: jest.fn() })
  })
  it('renders and walks through password, email, and otp steps', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.type(screen.getByLabelText(/current password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(
      await screen.findByLabelText(/new email address/i),
      'new@example.com'
    )
    await user.click(
      screen.getByRole('button', { name: /send verification code/i })
    )
    await user.type(
      await screen.findByLabelText(/verification code/i),
      '123456'
    )
    await user.click(
      screen.getByRole('button', { name: /confirm & update email/i })
    )
    expect(manageUserAccountService.verifyPassword).toHaveBeenCalledWith(
      'secret123'
    )
    expect(manageUserAccountService.requestEmailChange).toHaveBeenCalledWith(
      'new@example.com'
    )
    expect(manageUserAccountService.confirmEmailChange).toHaveBeenCalledWith(
      '123456'
    )
  })
})

describe('UpdateEmailModal validation and recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseUser.mockReturnValue({ refresh: jest.fn() })
  })
  const enterEmailStep = async () => {
    renderModal()
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    return screen.findByLabelText(/new email address/i)
  }
  const enterOtpStep = async () => {
    const email = await enterEmailStep()
    fireEvent.change(email, { target: { value: 'new@example.com' } })
    fireEvent.click(
      screen.getByRole('button', { name: /send verification code/i })
    )
    return screen.findByLabelText(/verification code/i)
  }
  const axiosError = (data: object, status = 400) => ({
    isAxiosError: true,
    response: { status, data },
  })

  it('does not render when closed', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <UpdateEmailModal open={false} onCloseAction={jest.fn()} />
      </QueryClientProvider>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
  it('rejects an empty password without calling the service', async () => {
    renderModal()
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(
      await screen.findByText('Please enter your password.')
    ).toBeInTheDocument()
    expect(manageUserAccountService.verifyPassword).not.toHaveBeenCalled()
  })
  it.each([
    [new Error('network'), 'Incorrect password.'],
    [
      axiosError({}, 429),
      'Too many attempts. Please wait a minute and try again.',
    ],
    [axiosError({ error: 'Password rejected' }), 'Password rejected'],
    [axiosError({ detail: 'Account locked' }), 'Account locked'],
  ])(
    'shows password verification errors and clears them on editing',
    async (error, message) => {
      jest
        .mocked(manageUserAccountService.verifyPassword)
        .mockRejectedValueOnce(error)
      renderModal()
      fireEvent.change(screen.getByLabelText(/current password/i), {
        target: { value: 'wrong' },
      })
      fireEvent.click(screen.getByRole('button', { name: /continue/i }))
      expect(await screen.findByText(message)).toBeInTheDocument()
      expect(
        screen.queryByLabelText(/new email address/i)
      ).not.toBeInTheDocument()
      fireEvent.change(screen.getByLabelText(/current password/i), {
        target: { value: 'retry' },
      })
      expect(screen.queryByText(message)).not.toBeInTheDocument()
    }
  )
  it('rejects a malformed email without starting a change', async () => {
    const input = await enterEmailStep()
    fireEvent.change(input, { target: { value: 'invalid@domain' } })
    fireEvent.submit(input.closest('form')!)
    expect(
      await screen.findByText('Please enter a valid email address.')
    ).toBeInTheDocument()
    expect(manageUserAccountService.requestEmailChange).not.toHaveBeenCalled()
  })
  it('requires a fresh password when reauthentication expires', async () => {
    jest
      .mocked(manageUserAccountService.requestEmailChange)
      .mockRejectedValueOnce(axiosError({ code: 'REAUTH_REQUIRED' }))
    const email = await enterEmailStep()
    fireEvent.change(email, { target: { value: 'new@example.com' } })
    fireEvent.click(
      screen.getByRole('button', { name: /send verification code/i })
    )
    expect(await screen.findByLabelText(/current password/i)).toHaveValue('')
    expect(
      screen.getByText('Please re-enter your password to continue.')
    ).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/verification code/i)
    ).not.toBeInTheDocument()
  })
  it('keeps the email step available after a failed request', async () => {
    jest
      .mocked(manageUserAccountService.requestEmailChange)
      .mockRejectedValueOnce(new Error('network'))
    const email = await enterEmailStep()
    fireEvent.change(email, { target: { value: 'new@example.com' } })
    fireEvent.click(
      screen.getByRole('button', { name: /send verification code/i })
    )
    expect(
      await screen.findByText('Could not start the email change.')
    ).toBeInTheDocument()
    expect(email).toHaveValue('new@example.com')
  })
  it('sanitizes the OTP and rejects incomplete codes', async () => {
    const otp = await enterOtpStep()
    fireEvent.change(otp, { target: { value: '12ab3' } })
    expect(otp).toHaveValue('123')
    fireEvent.click(
      screen.getByRole('button', { name: /confirm & update email/i })
    )
    expect(
      await screen.findByText('Enter the 6-digit code.')
    ).toBeInTheDocument()
    expect(manageUserAccountService.confirmEmailChange).not.toHaveBeenCalled()
    fireEvent.change(otp, { target: { value: '123456789' } })
    expect(otp).toHaveValue('123456')
  })
  it('disables resending while the cooldown is active', async () => {
    await enterOtpStep()
    const resend = screen.getByRole('button', { name: /resend in/i })
    expect(resend).toBeDisabled()
    fireEvent.click(resend)
    expect(manageUserAccountService.resendEmailChangeOtp).not.toHaveBeenCalled()
  })
  it('preserves the OTP step on confirmation failure', async () => {
    jest
      .mocked(manageUserAccountService.confirmEmailChange)
      .mockRejectedValueOnce(axiosError({ detail: 'Code expired' }))
    const otp = await enterOtpStep()
    fireEvent.change(otp, { target: { value: '123456' } })
    fireEvent.click(
      screen.getByRole('button', { name: /confirm & update email/i })
    )
    expect(await screen.findByText('Code expired')).toBeInTheDocument()
    expect(otp).toHaveValue('123456')
    expect(mockedUseUser().refresh).not.toHaveBeenCalled()
  })
  it('refreshes the user and closes after successful confirmation', async () => {
    const otp = await enterOtpStep()
    fireEvent.change(otp, { target: { value: '123456' } })
    fireEvent.click(
      screen.getByRole('button', { name: /confirm & update email/i })
    )
    await waitFor(() =>
      expect(mockedUseUser().refresh).toHaveBeenCalledTimes(1)
    )
    expect(await screen.findByLabelText(/current password/i)).toHaveValue('')
  })
})
