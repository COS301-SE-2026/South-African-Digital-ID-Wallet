import { render, screen } from '@testing-library/react'
import { ActivityOverviewCard } from '../activity-overview-card'

describe('ActivityOverviewCard', () => {
  it('renders the activity overview heading', () => {
    render(<ActivityOverviewCard />)

    expect(
      screen.getByRole('heading', { name: /activity overview/i })
    ).toBeInTheDocument()
  })

  it('renders recent activity items', () => {
    render(<ActivityOverviewCard />)

    expect(
      screen.getByText(/credential verified by bank official/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/login successful/i)).toBeInTheDocument()
  })
})
