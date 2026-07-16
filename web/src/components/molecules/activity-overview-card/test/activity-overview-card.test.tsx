import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    expect(
      screen.getByText(/driver's licence credential issued/i)
    ).toBeInTheDocument()

    expect(screen.getByText(/biometric login successful/i)).toBeInTheDocument()
  })

  it('opens the activity history modal when View all is clicked', async () => {
    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    await user.click(screen.getByRole('button', { name: /view all/i }))

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('closes the activity history modal when Close is clicked', async () => {
    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    await user.click(screen.getByRole('button', { name: /view all/i }))

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(
      screen.queryByRole('heading', { name: /activity history/i })
    ).not.toBeInTheDocument()
  })
})
