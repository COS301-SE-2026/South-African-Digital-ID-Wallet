import { render, screen, waitFor } from '@testing-library/react'
import { AccountCardCitizenDashboard } from '../citizen-dashboard-account-card'
import api from '@/lib/api'

jest.mock('@/lib/api')

const mockedApi = api as jest.Mocked<typeof api>

describe('AccountCardCitizenDashboard', () => {
  const mockUser = {
    userId: '1234567890123',
    saId: '9901015000123',
    names: 'LeBron',
    surname: 'James',
    citizenship: 'South African Citizen',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the account heading', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: mockUser,
    })

    render(<AccountCardCitizenDashboard />)

    expect(
      screen.getByRole('heading', { name: /your account/i })
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/lebron james/i)).toBeInTheDocument()
    })
  })

  it('renders the user information', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: mockUser,
    })

    render(<AccountCardCitizenDashboard />)

    expect(await screen.findByText(/lebron james/i)).toBeInTheDocument()

    expect(screen.getByText(/south african citizen/i)).toBeInTheDocument()

    expect(screen.getByText(/id ending ••••0123/i)).toBeInTheDocument()
  })

  it('renders an error message when the account cannot be loaded', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('API Error'))

    render(<AccountCardCitizenDashboard />)

    expect(
      await screen.findByText(/unable to load account information/i)
    ).toBeInTheDocument()
  })

  it('renders the manage account link', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: mockUser,
    })

    render(<AccountCardCitizenDashboard />)

    expect(
      await screen.findByRole('link', { name: /manage account/i })
    ).toBeInTheDocument()
  })

  it('shows the loading state initially', () => {
    mockedApi.get.mockImplementation(() => new Promise(() => {}))

    render(<AccountCardCitizenDashboard />)

    expect(screen.getByText(/loading account/i)).toBeInTheDocument()
  })
})
