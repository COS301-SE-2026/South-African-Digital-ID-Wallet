import { render, screen, waitFor } from '@testing-library/react-native'
import DisplayScreen from '@/app/qr/display'
import { useQrDisclosureStore } from '@/stores/qrDisclosureStore'
import qrService from '@/services/qr-service/qr-service'

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

jest.mock('@/services/qr-service/qr-service', () => ({
  __esModule: true,
  default: { generate: jest.fn() },
}))

describe('DisplayScreen', () => {
  beforeEach(() => {
    useQrDisclosureStore.setState({
      credentialId: 'test-credential-id',
      credentialType: 'identityDocument',
      mandatoryFields: ['Full name'],
      selectedOptionalFields: [],
    })
    jest.clearAllMocks()
  })

  it('shows the QR code and countdown once generation succeeds', async () => {
    ;(qrService.generate as jest.Mock).mockResolvedValue({
      token: 'fake-token',
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    })

    await render(<DisplayScreen />)

    await waitFor(() => {
      expect(screen.getByText('Valid credential')).toBeOnTheScreen()
    })
    expect(screen.getByText('1:00')).toBeOnTheScreen()
  })

  it('shows an error state when generation fails', async () => {
    ;(qrService.generate as jest.Mock).mockRejectedValue(
      new Error('Network error')
    )

    await render(<DisplayScreen />)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeOnTheScreen()
    })
  })
})
