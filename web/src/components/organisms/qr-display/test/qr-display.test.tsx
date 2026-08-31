import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QrDisplay } from '../qr-display'
import { qrService } from '@/services/qr-service'
import type { QrDisclosureSelection } from '@/services/qr-service'
jest.mock('@/services/qr-service', () => ({
  qrService: {
    generate: jest.fn(),
  },
}))
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}))
const baseSelection: QrDisclosureSelection = {
  credentialId: 'credential-123',
  credentialType: 'identityDocument',
  mandatoryFields: ['Identity number'],
  selectedOptionalFields: [],
}
describe('QrDisplay', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })
  it('shows a loading state initially', () => {
    ;(qrService.generate as jest.Mock).mockReturnValue(new Promise(() => {}))

    render(<QrDisplay selection={baseSelection} onBack={() => {}} />)

    expect(screen.getByText(/generating your qr code/i)).toBeInTheDocument()
  })
  it('shows the QR code once generated', async () => {
    ;(qrService.generate as jest.Mock).mockResolvedValue({
      token: 'qr-token-123',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    })

    render(<QrDisplay selection={baseSelection} onBack={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText(/valid for/i)).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', {
        name: /refresh qr code/i,
      })
    ).toBeInTheDocument()
  })
  it('shows an error state when generation fails', async () => {
    ;(qrService.generate as jest.Mock).mockRejectedValue(new Error('failed'))

    render(<QrDisplay selection={baseSelection} onBack={() => {}} />)

    await waitFor(() => {
      expect(
        screen.getByText(/could not generate your qr code/i)
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', {
        name: /try again/i,
      })
    ).toBeInTheDocument()
  })

  it('shows zero seconds once the countdown expires', async () => {
    const expiresAt = new Date(Date.now() + 2000).toISOString()

    ;(qrService.generate as jest.Mock).mockResolvedValue({
      token: 'qr-token-123',
      expiresAt,
    })

    render(<QrDisplay selection={baseSelection} onBack={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText(/valid for/i)).toBeInTheDocument()
    })
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    await waitFor(() => {
      expect(screen.getByText(/valid for 0:00/i)).toBeInTheDocument()
    })
  })
  it('calls onBack when back is clicked', async () => {
    ;(qrService.generate as jest.Mock).mockResolvedValue({
      token: 'qr-token-123',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    })
    const onBack = jest.fn()

    const user = userEvent.setup({
      delay: null,
    })

    render(
      <QrDisplay selection={baseSelection} onBack={onBack} showBackButton />
    )

    await waitFor(() => {
      expect(screen.getByText(/valid for/i)).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', {
        name: /^back$/i,
      })
    )

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('generates a new QR code when refresh is clicked', async () => {
    ;(qrService.generate as jest.Mock)
      .mockResolvedValueOnce({
        token: 'qr-token-first',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      })
      .mockResolvedValueOnce({
        token: 'qr-token-second',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      })

    const user = userEvent.setup({
      delay: null,
    })

    render(<QrDisplay selection={baseSelection} onBack={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText(/valid for/i)).toBeInTheDocument()
    })
    expect(qrService.generate).toHaveBeenCalledTimes(1)

    await user.click(
      screen.getByRole('button', {
        name: /refresh qr code/i,
      })
    )

    await waitFor(() => {
      expect(qrService.generate).toHaveBeenCalledTimes(2)
    })
  })
})
