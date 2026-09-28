import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdCard } from 'lucide-react'
import { CredentialCard } from '../credential-card'

describe('CredentialCard', () => {
  const mockOnToggle = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title and description', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Your verified national identity document."
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

  it('does not call onToggle when clicking a disabled checkbox', async () => {
    const user = userEvent.setup()
    render(
      <CredentialCard
        icon={IdCard}
        title="Driver's Licence"
        description="Description"
        activated={false}
        onToggle={mockOnToggle}
      />
    )
    const checkbox = screen.getByRole('checkbox')
    await expect(user.click(checkbox))
    expect(mockOnToggle).not.toHaveBeenCalled()
  })

  it('renders the checkbox as unchecked when activated is false', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        activated={false}
        onToggle={mockOnToggle}
      />
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('renders the checkbox as checked when activated is true', () => {
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        activated={true}
        onToggle={mockOnToggle}
      />
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onToggle with true when the unchecked checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        activated={false}
        onToggle={mockOnToggle}
      />
    )
    await user.click(screen.getByRole('checkbox'))
    expect(mockOnToggle).toHaveBeenCalledWith(true)
  })

  it('calls onToggle with false when the checked checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CredentialCard
        icon={IdCard}
        title="South African Identity Document"
        description="Description"
        activated={true}
        onToggle={mockOnToggle}
      />
    )
    await user.click(screen.getByRole('checkbox'))
    expect(mockOnToggle).toHaveBeenCalledWith(false)
  })
})
