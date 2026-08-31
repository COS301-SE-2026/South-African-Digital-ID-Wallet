import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionsCard } from '../quick-action-card'

const push = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('QuickActionsCard', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('renders the title and description', () => {
    render(
      <QuickActionsCard
        icon={<span />}
        title="Onboard Citizen"
        description="Register a new citizen onto FlashID."
        href="/onboard-citizen"
      />
    )
    expect(screen.getByText('Onboard Citizen')).toBeInTheDocument()
    expect(
      screen.getByText('Register a new citizen onto FlashID.')
    ).toBeInTheDocument()
  })

  it('navigates to href on click', () => {
    render(
      <QuickActionsCard
        icon={<span />}
        title="Onboard Citizen"
        description="Register a new citizen onto FlashID."
        href="/onboard-citizen"
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(push).toHaveBeenCalledWith('/onboard-citizen')
  })
})
