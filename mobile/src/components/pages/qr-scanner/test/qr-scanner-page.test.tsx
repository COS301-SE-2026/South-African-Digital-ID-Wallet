import { act, fireEvent, screen } from '@testing-library/react-native'
import { View } from 'react-native'
import {
  useNetworkStatus,
  useOfflineScan,
  useScanCredential,
  useVerifierTrust,
} from '@/hooks'
import { renderWithSafeArea } from '@/test/utils/render-with-providers'
import { QrScannerPage } from '../qr-scanner-page'

const mockAddListener = jest.fn()
const MockCamera = () => <View testID="mock-camera" />
const MockResultCard = () => <View testID="mock-result-card" />

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({ addListener: mockAddListener }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false }),
}))
jest.mock('@/hooks', () => ({
  useNetworkStatus: jest.fn(),
  useOfflineScan: jest.fn(),
  useRecordOffineVerification: jest.fn(),
  useScanCredential: jest.fn(),
  useVerifierTrust: jest.fn(),
}))
jest.mock('@/lib/offline/offline-scan-display', () => ({
  describeVerificationFailure: () => 'The issuer signature is not valid.',
  toOfflineScanDisplay: () => ({
    credentialType: "Driver's Licence",
    disclosedFields: {},
  }),
}))
jest.mock('@/components/organisms', () => ({
  QrCameraScanner: () => MockCamera(),
  ScanResultCard: () => MockResultCard(),
  ScannerHelpModal: () => null,
}))

const offlineScanMock = useOfflineScan as jest.Mock
const resetOnlineMock = jest.fn()
const resetOfflineMock = jest.fn()

const VERIFIED = {
  ok: true,
  vct: 'urn:flashid:drivers-license:1',
  revocationIndex: 1,
  claims: {},
  warnings: ['Revocation status was not checked'],
}

const FAILED = { ok: false, code: 'BAD_ISSUER_SIGNATURE', warnings: [] }

const withOfflineResult = (result: unknown) =>
  offlineScanMock.mockReturnValue({
    addFrame: jest.fn(),
    progress: null,
    reset: resetOfflineMock,
    result,
  })

describe('QrScannerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAddListener.mockReturnValue(jest.fn())
    ;(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: false })
    ;(useVerifierTrust as jest.Mock).mockReturnValue({ trust: null })
    ;(useScanCredential as jest.Mock).mockReturnValue({
      isResolving: false,
      reset: resetOnlineMock,
      resolve: jest.fn(),
      result: null,
    })
  })

  it('Should show the offline result with its warning', async () => {
    withOfflineResult(VERIFIED)

    await renderWithSafeArea(<QrScannerPage />)

    expect(screen.getByTestId('offline-scan-result-screen')).toBeTruthy()
    expect(screen.getByText('Revocation status was not checked')).toBeTruthy()
  })

  it('Should clear the offline result when Scan another code is pressed', async () => {
    withOfflineResult(VERIFIED)
    await renderWithSafeArea(<QrScannerPage />)

    await fireEvent.press(screen.getByTestId('scan-again-button'))

    expect(resetOfflineMock).toHaveBeenCalledTimes(1)
    expect(resetOnlineMock).toHaveBeenCalledTimes(1)
  })

  it('Should clear a failed offline result when Scan again is pressed', async () => {
    withOfflineResult(FAILED)
    await renderWithSafeArea(<QrScannerPage />)
    expect(screen.getByText('The issuer signature is not valid.')).toBeTruthy()

    await fireEvent.press(screen.getByTestId('scan-again-button'))

    expect(resetOfflineMock).toHaveBeenCalledTimes(1)
  })

  it('Should start a new scan when the Verify tab is pressed on this screen', async () => {
    withOfflineResult(VERIFIED)
    await renderWithSafeArea(<QrScannerPage />)
    const [, onTabPress] = mockAddListener.mock.calls.find(
      ([event]) => event === 'tabPress'
    )

    await act(async () => onTabPress())

    expect(resetOfflineMock).toHaveBeenCalledTimes(1)
    expect(resetOnlineMock).toHaveBeenCalledTimes(1)
  })

  it('Should stop listening for tab presses when the screen closes', async () => {
    const unsubscribe = jest.fn()
    mockAddListener.mockReturnValue(unsubscribe)
    withOfflineResult(VERIFIED)
    const { unmount } = await renderWithSafeArea(<QrScannerPage />)

    await act(async () => unmount())

    expect(unsubscribe).toHaveBeenCalled()
  })
})
