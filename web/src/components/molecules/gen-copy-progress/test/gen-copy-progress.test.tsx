import { render, screen } from '@testing-library/react'
import { GenCopyProgress } from '../gen-copy-progress'

describe('GenCopyProgress', () => {
  it('renders the progress dialog and heading', () => {
    render(<GenCopyProgress currentStep={1} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByRole('heading', { name: /generate certified copy/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/preparing your verified document/i)
    ).toBeInTheDocument()
  })
  it('renders all certified copy steps', () => {
    render(<GenCopyProgress currentStep={1} />)
    expect(screen.getByRole('list')).toHaveAttribute(
      'aria-label',
      'Certified copy generation progress'
    )
    expect(screen.getByText('Validating credential')).toBeInTheDocument()
    expect(screen.getByText('Creating certified document')).toBeInTheDocument()
    expect(screen.getByText('Finalizing certified copy')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })
  it('shows the active and pending step states', () => {
    const { container } = render(<GenCopyProgress currentStep={3} />)
    expect(screen.getByText('Finalizing certified copy')).toHaveClass(
      'text-deep-green'
    )
    expect(screen.getByText('Complete')).toHaveClass('text-muted-text')
    expect(container.querySelectorAll('.animate-spin')).toHaveLength(1)
  })
  it('renders the informational message', () => {
    render(<GenCopyProgress currentStep={2} />)
    expect(
      screen.getByText(/this usually takes a few seconds/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/please do not close this window/i)
    ).toBeInTheDocument()
  })
})