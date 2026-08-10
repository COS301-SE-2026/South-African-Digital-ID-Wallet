import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdCard } from 'lucide-react'
import { CredentialCard } from '../credential-card'

describe('CredentialCard', () => {
  it('renders the title and description', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Your verified national identity document."
        available={true}
        activated={false}
        onToggle={() => {}}
      />
    )
    expect(
      screen.getByText('South African Identity Document')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Your verified national identity document.')
    ).toBeInTheDocument()
  })

  it('shows "Available" when available is true', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        available={true}
        activated={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('shows "Unavailable" when available is false', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="Driver's Licence"
        description="Description"
        available={false}
        activated={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('renders the checkbox as unchecked when activated is false', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        available={true}
        activated={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders the checkbox as checked when activated is true', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        available={true}
        activated={true}
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('disables the checkbox when available is false', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="Driver's Licence"
        description="Description"
        available={false}
        activated={false}
        onToggle={() => {}}
      />
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('calls onToggle with true when the unchecked checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        available={true}
        activated={false}
        onToggle={onToggle}
      />
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('calls onToggle with false when the checked checkbox is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        available={true}
        activated={true}
        onToggle={onToggle}
      />
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('does not call onToggle when clicking a disabled checkbox', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()
    render(
      <CredentialCard
        icon={IdCard}
        title="Driver's Licence"
        description="Description"
        available={false}
        activated={false}
        onToggle={onToggle}
      />
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).not.toHaveBeenCalled()
  })
})
