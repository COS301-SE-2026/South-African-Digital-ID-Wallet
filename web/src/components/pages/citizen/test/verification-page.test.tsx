import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VerificationPage } from '../verification-page'
import scanService, { parseScannedToken } from '@/services/scan-service'

jest.mock('@/components/organisms/qr-camera-scanner', () => ({
  QrCameraScanner: ({ onScan }: { onScan: (text: string) => void }) => (
    <button onClick={() => onScan('mock-scanned-text')}>
      Simulating the scan
    </button>
  ),
}))

jest.mock('@/services/scan-service', () => ({
  __esModule: true,
  default: { resolveCred: jest.fn() },
  parseScannedToken: jest.fn(),
}))

describe('VerificationPage', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows the camera scanner intitally', () => {
    render(<VerificationPage />)
    expect(screen.getByText('Simulating the scan')).toBeInTheDocument()
  })

  it('shows an error when the scanned code cannot be parsed', async () => {
    const user = userEvent.setup()
    ;(parseScannedToken as jest.Mock).mockReturnValue(null)
    render(<VerificationPage />)

    await user.click(screen.getByText('Simulating the scan'))
    await waitFor(() => {
      expect(
        screen.getByText(/not a valid flashid qr code/i)
      ).toBeInTheDocument()
    })
  })

  it('shows a "not yet available" message for badge tokens', async () => {
    const user = userEvent.setup()
    ;(parseScannedToken as jest.Mock).mockReturnValue({
      type: 'badge',
      token: 'mock-scanned-text',
    })

    render(<VerificationPage />)

    await user.click(screen.getByText('Simulating the scan'))
    await waitFor(() => {
      expect(
        screen.getByText(/scanning official badges is not available yet/i)
      ).toBeInTheDocument()
    })
  })

  it('shows the resolved credential on a successful scan', async () => {
    const user = userEvent.setup()
    ;(parseScannedToken as jest.Mock).mockReturnValue({
      type: 'disclosure',
      token: 'mock-scanned-text',
    })
    ;(scanService.resolveCred as jest.Mock).mockReturnValue({
      credentialType: 'Identity Document',
      disclosedFields: { 'SA ID number': '9001015800083' },
    })

    render(<VerificationPage />)

    await user.click(screen.getByText('Simulating the scan'))
    await waitFor(() => {
      expect(screen.getByText('Identity Document')).toBeInTheDocument()
      expect(screen.getByText('SA ID number')).toBeInTheDocument()
      expect(screen.getByText('9001015800083')).toBeInTheDocument()
    })
  })

  it('shows an error when resolving fails', async () => {
    const user = userEvent.setup()
    ;(parseScannedToken as jest.Mock).mockReturnValue({
      type: 'disclosure',
      token: 'mock-scanned-text',
    })
    ;(scanService.resolveCred as jest.Mock).mockRejectedValue(
      new Error('rejected')
    )

    render(<VerificationPage />)

    await user.click(screen.getByText('Simulating the scan'))
    await waitFor(() => {
      expect(
        screen.getByText(/invalid, expired, or has already been used/i)
      ).toBeInTheDocument()
    })
  })

  it('returns to scanning when "scan again" is clicked after an error', async () => {
    const user = userEvent.setup()
    ;(parseScannedToken as jest.Mock).mockReturnValue(null)

    render(<VerificationPage />)

    await user.click(screen.getByText('Simulating the scan'))
    await waitFor(() => {
      expect(
        screen.getByText(/not a valid flashid qr code/i)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /scan again/i }))

    expect(screen.getByText('Simulating the scan')).toBeInTheDocument()
  })
})
