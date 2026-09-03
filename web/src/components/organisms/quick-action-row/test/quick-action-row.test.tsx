import { render, screen } from '@testing-library/react'
import { QuickActionsRow } from '../quick-action-row'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

const actions = [
  {
    key: 'onboard',
    icon: <span />,
    tone: 'green' as const,
    title: 'Onboard Citizen',
    description: 'Register a new citizen onto FlashID.',
    href: '/onboard-citizen',
  },
  {
    key: 'license',
    icon: <span />,
    tone: 'gold' as const,
    title: "Issue Driver's License",
    description: 'Issue a digital driver’s license to an active citizen.',
    href: '/issue-license',
  },
]

describe('QuickActionsRow', () => {
  it('renders a card for every action', () => {
    render(<QuickActionsRow actions={actions} />)
    expect(screen.getByText('Onboard Citizen')).toBeInTheDocument()
    expect(screen.getByText("Issue Driver's License")).toBeInTheDocument()
  })
})
