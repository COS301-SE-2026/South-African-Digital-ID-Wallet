import { render, screen } from '@testing-library/react'
import ReadyItem from '../ready-item'

const TestIcon = ({ className }: { className?: string }) => (
  <svg data-testid="ready-icon" className={className} />
)
describe('ReadyItem', () => {
  it('renders the icon, title, and description', () => {
    render(
      <ReadyItem
        icon={TestIcon}
        title="Identity verified"
        description="Your identity has been successfully verified."
      />
    )
    expect(screen.getByTestId('ready-icon')).toBeInTheDocument()
    expect(screen.getByText('Identity verified')).toBeInTheDocument()
    expect(
      screen.getByText('Your identity has been successfully verified.')
    ).toBeInTheDocument()
  })
})