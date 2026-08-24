import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { RevokeCredentialModal } from '../revoke-credentials-modal'

describe('RevokeCredentialModal', () => {
  const onClose = jest.fn()
  const onConfirm = jest.fn()
  const defaultProps = {
    isOpen: true,
    onClose,
    onConfirm,
    citizenName: 'John Smith',
    credentialLabel: 'National ID',
    credentialId: 'cred-123',
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the revocation modal', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    expect(
      screen.getByRole('heading', { name: /revoke credential/i })
    ).toBeInTheDocument()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText(/National ID \(cred-123\)/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<RevokeCredentialModal {...defaultProps} isOpen={false} />)
    expect(
      screen.queryByRole('heading', { name: /revoke credential/i })
    ).not.toBeInTheDocument()
  })

  it('confirm button is disabled when no reason is selected', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: /confirm revocation/i })
    ).toBeDisabled()
  })

  it('allows selecting a revocation reason', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    const select = screen.getByLabelText('Reason')
    fireEvent.change(select, {
      target: {
        value: 'fraud',
      },
    })
    expect(select).toHaveValue('fraud')
  })

  it('enables confirm button after selecting a reason', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    const select = screen.getByLabelText('Reason')
    fireEvent.change(select, {
      target: {
        value: 'fraud',
      },
    })
    expect(
      screen.getByRole('button', { name: /confirm revocation/i })
    ).toBeEnabled()
  })

  it('allows entering additional notes', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    const textarea = screen.getByLabelText('Additional Notes')
    fireEvent.change(textarea, {
      target: {
        value: 'Credential was reported as compromised.',
      },
    })
    expect(textarea).toHaveValue('Credential was reported as compromised.')
  })

  it('does not confirm when no reason is selected', async () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /confirm revocation/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirms the revocation with the selected reason and notes', async () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: {
        value: 'fraud',
      },
    })
    fireEvent.change(screen.getByLabelText('Additional Notes'), {
      target: {
        value: 'Credential was compromised.',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: /confirm revocation/i }))
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith({
        reason: 'fraud',
        notes: 'Credential was compromised.',
      })
    })
  })

  it('closes and resets the form when Cancel is clicked', () => {
    render(<RevokeCredentialModal {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: {
        value: 'fraud',
      },
    })
    fireEvent.change(screen.getByLabelText('Additional Notes'), {
      target: {
        value: 'Some notes',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the loading state while submitting', () => {
    render(<RevokeCredentialModal {...defaultProps} isSubmitting={true} />)
    expect(
      screen.getByRole('button', { name: /confirm revocation/i })
    ).toBeDisabled()
  })
})
