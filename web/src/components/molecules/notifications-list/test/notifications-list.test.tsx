import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationsList } from '../notifications-list'
import api from '@/lib/api'

jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

const mockNotifications = [
  {
    id: '1',
    title: "Driver's Licence expires in 7 days",
    description: 'Renew soon to avoid disruption.',
  },
  {
    id: '2',
    title: 'Passport expires in 3 months',
    description: 'Plan ahead for renewal.',
  },
]

describe('NotificationsList', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: mockNotifications })
  })

  it('renders the heading and the preview list', async () => {
    render(<NotificationsList />)

    expect(
      await screen.findByText("Driver's Licence expires in 7 days")
    ).toBeInTheDocument()

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Passport expires in 3 months')).toBeInTheDocument()
  })

  it('opens the full notifications modal when "View all" is clicked', async () => {
    render(<NotificationsList />)

    const viewAllBtn = await screen.findByRole('button', { name: /view all/i })
    fireEvent.click(viewAllBtn)

    expect(screen.getByText('All Notifications')).toBeInTheDocument()
    expect(
      screen.getAllByText("Driver's Licence expires in 7 days").length
    ).toBeGreaterThan(0)
  })

  it('closes the modal when Close is clicked', async () => {
    render(<NotificationsList />)

    const viewAllBtn = await screen.findByRole('button', { name: /view all/i })
    fireEvent.click(viewAllBtn)
    expect(screen.getByText('All Notifications')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    await waitFor(() =>
      expect(screen.queryByText('All Notifications')).not.toBeInTheDocument()
    )
  })
})
