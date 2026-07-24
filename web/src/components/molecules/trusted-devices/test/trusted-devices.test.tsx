import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrustedDevices } from '../trusted-devices'
import api from '@/lib/api'

jest.mock('@/lib/api')
const mockedApi = api as jest.Mocked<typeof api>

const mockDevices = [
  {
    id: '1',
    deviceName: 'iPhone 16 Pro Max',
    deviceType: 'Mobile',
    location: 'Pretoria, Gauteng',
    lastActive: '2026-07-20T12:00:00Z',
    isCurrentDevice: true,
    isTrusted: true,
  },
  {
    id: '2',
    deviceName: 'Brave Web Portal',
    deviceType: 'Desktop',
    location: 'Johannesburg, Gauteng',
    lastActive: '2026-07-18T09:00:00Z',
    isCurrentDevice: false,
    isTrusted: true,
  },
  {
    id: '3',
    deviceName: 'iPad Pro',
    deviceType: 'Tablet',
    location: 'Cape Town, Western Cape',
    lastActive: '2026-07-15T15:00:00Z',
    isCurrentDevice: false,
    isTrusted: true,
  },
]

describe('TrustedDevices', () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({ data: mockDevices })
  })

  it('renders the trusted devices heading', async () => {
    render(<TrustedDevices />)

    expect(
      await screen.findByRole('heading', { name: /trusted devices/i })
    ).toBeInTheDocument()
  })

  it('renders the list of trusted devices', async () => {
    render(<TrustedDevices />)

    expect(await screen.findByText(/iphone 16 pro max/i)).toBeInTheDocument()
    expect(screen.getByText(/brave web portal/i)).toBeInTheDocument()
    expect(screen.getByText(/ipad pro/i)).toBeInTheDocument()
  })

  it('renders the device status labels', async () => {
    render(<TrustedDevices />)

    expect(await screen.findByText('Active')).toBeInTheDocument()
    expect(screen.getAllByText('Known')).toHaveLength(2)
  })

  it('opens the manage devices modal', async () => {
    const user = userEvent.setup()

    render(<TrustedDevices />)

    const manageBtn = await screen.findByRole('button', { name: /manage/i })
    await user.click(manageBtn)

    expect(
      screen.getAllByRole('heading', { name: /trusted devices/i })
    ).toHaveLength(2)

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders an unlink button for each non-active device in the modal', async () => {
    const user = userEvent.setup()

    render(<TrustedDevices />)

    const manageBtn = await screen.findByRole('button', { name: /manage/i })
    await user.click(manageBtn)

    expect(
      screen.getAllByRole('button', { name: /unlink device/i })
    ).toHaveLength(2)
  })

  it('closes the modal when Close is clicked', async () => {
    const user = userEvent.setup()

    render(<TrustedDevices />)

    const manageBtn = await screen.findByRole('button', { name: /manage/i })
    await user.click(manageBtn)

    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() =>
      expect(
        screen.getAllByRole('heading', { name: /trusted devices/i })
      ).toHaveLength(1)
    )
  })
})
