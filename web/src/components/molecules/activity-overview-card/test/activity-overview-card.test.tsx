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
    jest.clearAllMocks()
  })

  it('shows the loading state while activity is being fetched', () => {
    mockedApi.get.mockReturnValue(new Promise(() => {}))

    render(<ActivityOverviewCard />)

    expect(
      screen.getByRole('heading', { name: /activity overview/i })
    ).toBeInTheDocument()

    expect(screen.getByText(/loading activity/i)).toBeInTheDocument()
  })

  it('renders the activity overview heading', async () => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })
    render(<ActivityOverviewCard />)

    expect(
      await screen.findByRole('heading', { name: /activity overview/i })
    ).toBeInTheDocument()
  })

  it('renders all recent activity items', async () => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })

    render(<ActivityOverviewCard />)

    expect(
      await screen.findByText(/credential verified by bank official/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/driver's licence credential issued/i)
    ).toBeInTheDocument()

    expect(screen.getByText(/biometric login successful/i)).toBeInTheDocument()
  })

  it('renders the View all button', async () => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })

    render(<ActivityOverviewCard />)

    expect(
      await screen.findByRole('button', { name: /view all/i })
    ).toBeInTheDocument()
  })

  it('opens the activity history modal when View all is clicked', async () => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })
    const user = userEvent.setup()
    render(<ActivityOverviewCard />)
    const viewAllButton = await screen.findByRole('button', {
      name: /view all/i,
    })
    await user.click(viewAllButton)
    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })
  it('shows all activity items inside the activity history modal', async () => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })
    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    const viewAllButton = await screen.findByRole('button', {
      name: /view all/i,
    })

    await user.click(viewAllButton)

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    expect(
      screen.getAllByText(/credential verified by bank official/i)
    ).toHaveLength(2)

    expect(
      screen.getAllByText(/driver's licence credential issued/i)
    ).toHaveLength(2)

    expect(screen.getAllByText(/biometric login successful/i)).toHaveLength(2)
  })

  it('closes the activity history modal when Close is clicked', async () => {
    mockedApi.get.mockResolvedValue({ data: mockActivity })
    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    const viewAllButton = await screen.findByRole('button', {
      name: /view all/i,
    })

    await user.click(viewAllButton)

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /close/i,
      })
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', {
          name: /activity history/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  it('shows a message when there is no activity', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })

    render(<ActivityOverviewCard />)

    expect(await screen.findByText(/no activity found/i)).toBeInTheDocument()
  })

  it('shows no activity in the modal when there is no activity', async () => {
    mockedApi.get.mockResolvedValue({ data: [] })

    const user = userEvent.setup()

    render(<ActivityOverviewCard />)

    const viewAllButton = await screen.findByRole('button', {
      name: /view all/i,
    })

    await user.click(viewAllButton)

    expect(
      screen.getByRole('heading', { name: /activity history/i })
    ).toBeInTheDocument()

    expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
  })

  it('handles an API error without crashing', async () => {
    mockedApi.get.mockRejectedValue(new Error('API error'))

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    render(<ActivityOverviewCard />)

    await waitFor(() => {
      expect(screen.getByText(/no activity found/i)).toBeInTheDocument()
    })

    consoleErrorSpy.mockRestore()
  })
})
