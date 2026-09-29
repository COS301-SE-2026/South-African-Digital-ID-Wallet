import { fireEvent, render, screen } from '@testing-library/react'
import { RevokeCredentialModal } from '../revoke-credentials-modal'

describe('RevokeCredentialModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    isSubmitting: false,
    citizenName: 'John Smith',
    credentialLabel: 'National ID',
    credentialId: 'cred-123',
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the revoke credential modal', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: /revoke credential/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/additional notes/i)).toBeInTheDocument()
  })

  it('renders the credential information', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText(/National ID\s*\(cred-123\)/)).toBeInTheDocument()
  })

  it('disables confirm button when no reason is selected', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    const confirmButton = screen.getByRole('button', {
      name: /confirm revocation/i,
    })
    expect(confirmButton).toBeDisabled()
  })

  it('does not confirm when no reason is selected', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    const confirmButton = screen.getByRole('button', {
      name: /confirm revocation/i,
    })
    fireEvent.click(confirmButton)
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('enables confirm button when a reason is selected', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    const reasonSelect = screen.getByLabelText(/reason/i)
    fireEvent.change(reasonSelect, {
      target: { value: 'expired' },
    })
    const confirmButton = screen.getByRole('button', {
      name: /confirm revocation/i,
    })
    expect(confirmButton).not.toBeDisabled()
  })

  it('calls onConfirm when a reason is selected', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: 'expired' },
    })
    fireEvent.click(
      screen.getByRole('button', {
        name: /confirm revocation/i,
      })
    )
    expect(defaultProps.onConfirm).toHaveBeenCalledWith({
      reason: 'expired',
      notes: '',
    })
  })

  it('calls onClose when cancel is clicked', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /cancel/i,
      })
    )
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /close/i,
      })
    )
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('passes notes when confirming revocation', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.change(screen.getByLabelText(/reason/i), {
      target: { value: 'expired' },
    })
    fireEvent.change(screen.getByLabelText(/additional notes/i), {
      target: { value: 'Credential has expired.' },
    })
    fireEvent.click(
      screen.getByRole('button', {
        name: /confirm revocation/i,
      })
    )
    expect(defaultProps.onConfirm).toHaveBeenCalledWith({
      reason: 'expired',
      notes: 'Credential has expired.',
    })
  })

  it('shows the loading state while submitting', () => {
    render(<RevokeCredentialModal {...defaultProps} isSubmitting={true} />)
    const confirmButton = document.querySelector(
      '[data-cy="revoke-confirm-button"]'
    )
    expect(confirmButton).toBeDisabled()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })
})
