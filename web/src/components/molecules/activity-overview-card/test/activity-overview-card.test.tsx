import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActivityOverviewCard } from '../activity-overview-card'
import api from '@/lib/api'

jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

const mockActivity = [
  {
    id: '1',
    title: 'Credential verified by bank official',
    timestamp: '2026-07-01T10:00:00Z',
    type: 'credentialverified',
  },
  {
    id: '2',
    title: "Driver's Licence credential issued",
    timestamp: '2026-06-15T09:30:00Z',
    type: 'licenseissued',
  },
  {
    id: '3',
    title: 'Biometric login successful',
    timestamp: '2026-06-10T08:00:00Z',
    type: 'biometriclogin',
  },
]

describe('ActivityOverviewCard', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })
  })

  it('renders the activity overview heading', async () => {
    render(<ActivityOverviewCard />)

    expect(
      await screen.findByRole('heading', { name: /activity overview/i })
    ).toBeInTheDocument()
  })

  it('renders recent activity items', async () => {
    render(<ActivityOverviewCard />)

    expect(
      await screen.findByText(/credential verified by bank official/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/driver's licence credential issued/i)
    ).toBeInTheDocument()

    expect(screen.getByText(/biometric login successful/i)).toBeInTheDocument()
  })

  it('opens the activity history modal when View all is clicked', async () => {
    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    const viewAllBtn = await screen.findByRole('button', { name: /view all/i })
    await user.click(viewAllBtn)

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('closes the activity history modal when Close is clicked', async () => {
    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    const viewAllBtn = await screen.findByRole('button', { name: /view all/i })
    await user.click(viewAllBtn)

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: /activity history/i })
      ).not.toBeInTheDocument()
    )
  })
})
