import { render, screen } from '@testing-library/react'
import { ChangePasswordModal } from '@/components/molecules'

jest.mock('@/components/molecules/change-password-card', () => ({
  ChangePasswordCard: () => <div data-testid="change-password-card" />,
}))

describe('ChangePasswordModal', () => {
  it('does not render when closed', () => {
    render(<ChangePasswordModal open={false} onCloseAction={jest.fn()} />)

    expect(screen.queryByTestId('change-password-card')).not.toBeInTheDocument()
  })

  it('renders the password card when open', () => {
    render(<ChangePasswordModal open={true} onCloseAction={jest.fn()} />)

    expect(screen.getByTestId('change-password-card')).toBeInTheDocument()
  })
})
