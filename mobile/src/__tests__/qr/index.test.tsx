import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native'
import CredentialsListScreen from '@/app/qr/index'
import qrService from '@/services/qr-service/qr-service'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}))

jest.mock('@/services/qr-service/qr-service', () => ({
  __esModule: true,
  default: { getMine: jest.fn(), generate: jest.fn() },
}))

describe('CredentialsListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows each active credential returned by the API', async () => {
    ;(qrService.getMine as jest.Mock).mockResolvedValue([
      { id: 'cred-1', credentialType: 'Identity Document' },
      { id: 'cred-2', credentialType: "Driver's License" },
    ])

    await render(<CredentialsListScreen />)

    await waitFor(() => {
      expect(screen.getByText('Identity Document')).toBeOnTheScreen()
    })
    expect(screen.getByText("Driver's License")).toBeOnTheScreen()
  })

  it('shows a message when there are no active credentials', async () => {
    ;(qrService.getMine as jest.Mock).mockResolvedValue([])

    await render(<CredentialsListScreen />)

    await waitFor(() => {
      expect(
        screen.getByText('You have no active credentials.')
      ).toBeOnTheScreen()
    })
  })

  it('navigates to select-fields when a credential is pressed', async () => {
    ;(qrService.getMine as jest.Mock).mockResolvedValue([
      { id: 'cred-1', credentialType: 'Identity Document' },
    ])

    await render(<CredentialsListScreen />)

    await waitFor(() => {
      expect(screen.getByText('Identity Document')).toBeOnTheScreen()
    })

    await fireEvent.press(screen.getByText('Identity Document'))

    expect(mockPush).toHaveBeenCalledWith('/qr/select-fields')
  })
})
