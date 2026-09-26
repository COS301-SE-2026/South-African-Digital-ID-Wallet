import { render, screen } from '@testing-library/react'
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
