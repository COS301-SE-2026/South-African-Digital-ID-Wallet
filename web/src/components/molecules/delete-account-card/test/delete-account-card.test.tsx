import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { DeleteAccountCard } from '../delete-account-card'
import api from '@/lib/api'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    delete: jest.fn(),
  },
}))

describe('DeleteAccountCard', () => {
  const push = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push })
  })

  it('renders the initial card with a Delete Account button', () => {
    render(<DeleteAccountCard />)
    expect(
      screen.getByRole('heading', { name: 'Delete Account' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Delete Account' })
    ).toBeInTheDocument()
  })

  it('opens the confirmation modal when Delete Account is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(
      screen.getByText(/are you sure you want to permanently delete/i)
    ).toBeInTheDocument()
  })

  it('closes the modal when "No" is clicked on the first confirmation step', async () => {
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'No' }))
    expect(
      screen.queryByText(/are you sure you want to permanently delete/i)
    ).not.toBeInTheDocument()
  })

  it('advances to the final confirmation step when "Yes" is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(
      screen.getByRole('heading', { name: 'Final Confirmation' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Type "DELETE"')).toBeInTheDocument()
  })

  it('disables the Permanently Delete button until "DELETE" is typed exactly', async () => {
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    const input = screen.getByLabelText('Type "DELETE"')
    const deleteButton = screen.getByRole('button', {
      name: 'Permanently Delete',
    })

    expect(deleteButton).toBeDisabled()
    await user.type(input, 'delete')
    expect(deleteButton).toBeDisabled()
    await user.clear(input)
    await user.type(input, 'DELETE')
    expect(deleteButton).toBeEnabled()
  })

  it('resets state when Cancel is clicked on the final confirmation step', async () => {
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    await user.type(screen.getByLabelText('Type "DELETE"'), 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(/final confirmation/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    expect(
      screen.getByText(/are you sure you want to permanently delete/i)
    ).toBeInTheDocument()
  })

  it('calls the delete API, shows a success toast, closes the modal, and redirects on success', async () => {
    ;(api.delete as jest.Mock).mockResolvedValueOnce({})
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    await user.type(screen.getByLabelText('Type "DELETE"'), 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Permanently Delete' }))

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/account')
    })
    expect(toast.success).toHaveBeenCalledWith(
      'Your account has been permanently deleted.'
    )
    expect(push).toHaveBeenCalledWith('/')
    await waitFor(() => {
      expect(screen.queryByText(/final confirmation/i)).not.toBeInTheDocument()
    })
  })

  it('shows an error toast and keeps the modal open when the delete request fails', async () => {
    ;(api.delete as jest.Mock).mockRejectedValueOnce(new Error('network error'))
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    await user.type(screen.getByLabelText('Type "DELETE"'), 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Permanently Delete' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete your account. Please try again.'
      )
    })

    expect(push).not.toHaveBeenCalled()
    expect(
      screen.getByRole('heading', { name: 'Final Confirmation' })
    ).toBeInTheDocument()
    consoleErrorSpy.mockRestore()
  })

  it('disables Cancel and shows a loading label while the delete request is in flight', async () => {
    let resolveDelete: () => void
    ;(api.delete as jest.Mock).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve
        })
    )
    const user = userEvent.setup()
    render(<DeleteAccountCard />)
    await user.click(screen.getByRole('button', { name: 'Delete Account' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    await user.type(screen.getByLabelText('Type "DELETE"'), 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Permanently Delete' }))
    expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    resolveDelete!()
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/')
    })
  })
})
