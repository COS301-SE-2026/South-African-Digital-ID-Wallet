import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react'
import '@testing-library/jest-dom'

import { ManageUserTrustedDevices } from '../manage-user-trusted-devices'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  delete: jest.fn(),
}))

jest.mock('@/components/molecules/dashboard-modal/dashboard-modal', () => ({
  DashboardModal: ({
    open,
    title,
    children,
  }: {
    open: boolean
    title: string
    children: React.ReactNode
  }) =>
    open ? (
      <div data-testid="dashboard-modal">
        <h1>{title}</h1>
        {children}
      </div>
    ) : null,
}))

describe('ManageUserTrustedDevices', () => {
  const mockedApi = api as jest.Mocked<typeof api>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state', () => {
    mockedApi.get.mockReturnValue(new Promise(() => {}))

    render(<ManageUserTrustedDevices />)

    expect(screen.getByText(/Loading trusted devices/i)).toBeInTheDocument()
  })

  it('renders empty state', async () => {
    mockedApi.get.mockResolvedValue({
      data: [],
    })

    render(<ManageUserTrustedDevices />)

    expect(
      await screen.findByText(/No trusted devices found/i)
    ).toBeInTheDocument()
  })

  it('renders trusted devices', async () => {
    mockedApi.get.mockResolvedValue({
      data: [
        {
          id: '1',
          deviceName: 'MacBook Pro',
          deviceType: 'Laptop',
          location: 'Pretoria',
          lastActive: '2026-07-28T10:00:00Z',
          isCurrentDevice: true,
          isTrusted: true,
        },
        {
          id: '2',
          deviceName: 'iPhone',
          deviceType: 'Phone',
          location: 'Johannesburg',
          lastActive: '2026-07-27T10:00:00Z',
          isCurrentDevice: false,
          isTrusted: true,
        },
      ],
    })

    render(<ManageUserTrustedDevices />)

    expect(await screen.findByText('MacBook Pro')).toBeInTheDocument()
    expect(screen.getByText('iPhone')).toBeInTheDocument()

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Known')).toBeInTheDocument()
  })

  it('opens the modal', async () => {
    mockedApi.get.mockResolvedValue({
      data: [],
    })

    render(<ManageUserTrustedDevices />)

    await screen.findByText(/No trusted devices found/i)

    fireEvent.click(screen.getByRole('button', { name: /Manage devices/i }))

    const modal = screen.getByTestId('dashboard-modal')
    expect(modal).toBeInTheDocument()
    expect(within(modal).getByText('Trusted Devices')).toBeInTheDocument()
  })

  it('unlinks a known device', async () => {
    mockedApi.get.mockResolvedValue({
      data: [
        {
          id: '1',
          deviceName: 'Laptop',
          deviceType: 'Laptop',
          location: 'Pretoria',
          lastActive: '2026-07-27T10:00:00Z',
          isCurrentDevice: false,
          isTrusted: true,
        },
      ],
    })

    mockedApi.delete.mockResolvedValue({})

    render(<ManageUserTrustedDevices />)

    await screen.findByText('Laptop')

    fireEvent.click(screen.getByRole('button', { name: /Manage devices/i }))

    fireEvent.click(screen.getByRole('button', { name: /Unlink Device/i }))

    await waitFor(() =>
      expect(mockedApi.delete).toHaveBeenCalledWith('/api/trusted-devices/1')
    )
  })

  it('handles fetch failure gracefully', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})

    mockedApi.get.mockRejectedValue(new Error('Network Error'))

    render(<ManageUserTrustedDevices />)

    await waitFor(() =>
      expect(screen.getByText(/No trusted devices found/i)).toBeInTheDocument()
    )

    expect(console.error).toHaveBeenCalled()
    ;(console.error as jest.Mock).mockRestore()
  })
})
