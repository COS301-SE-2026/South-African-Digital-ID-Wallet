import { fireEvent, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import {
  useCountdown,
  useKeyBindingFrame,
  useNetworkStatus,
  useOfflinePackage,
  useQrToken,
  useWalletCredential,
} from '@/hooks'
import {
  createOfflinePresentation,
  isPackageUsable,
} from '@/lib/offline/offline-presentation'
import { renderWithSafeArea } from '@/test/utils/render-with-providers'
import { QrGenerationPage } from '../qr-generation-page'

type MockDisclosureProps = {
  isVisible: boolean
  onConfirm: (fields: string[]) => void
}

type MockCardProps = {
  offlineFrames?: readonly string[]
  testID?: string
  token?: string
}

const MockDisclosureModal = ({ isVisible, onConfirm }: MockDisclosureProps) =>
  isVisible ? (
    <View>
      <Pressable
        onPress={() => onConfirm(['License number'])}
        testID="mock-share-licence-number"
      >
        <Text>Share license number</Text>
      </Pressable>
      <Pressable
        onPress={() => onConfirm([])}
        testID="mock-share-mandatory-only"
      >
        <Text>Share mandatory fields only</Text>
      </Pressable>
    </View>
  ) : null

const MockQrCodeCard = ({
  offlineFrames = [],
  testID = 'qr-code-card',
  token,
}: MockCardProps) => (
  <View testID={testID}>
    <Text>
      {offlineFrames.length > 0 ? `${offlineFrames.length} frames` : token}
    </Text>
  </View>
)

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock('@/hooks', () => ({
  useCountdown: jest.fn(),
  useKeyBindingFrame: jest.fn(),
  useNetworkStatus: jest.fn(),
  useOfflinePackage: jest.fn(),
  useQrToken: jest.fn(),
  useWalletCredential: jest.fn(),
}))
jest.mock('@/lib/offline/offline-presentation', () => ({
  createOfflinePresentation: jest.fn(),
  isPackageUsable: jest.fn(),
}))
jest.mock('@/lib/offline/qr-frames', () => ({
  ...jest.requireActual('@/lib/offline/qr-frames'),
  splitPayloadFrames: jest.fn(() => [
    { encoded: 'FID1:P:abcdef:0/2:first', tid: 'abcedf' },
    { encoded: 'FID1:P:abcdef:1/2:second', tid: 'abcdef' },
  ]),
}))
jest.mock('@/components/organisms', () => ({
  DisclosureModal: (props: MockDisclosureProps) => MockDisclosureModal(props),
  QrCodeCard: (props: MockCardProps) => MockQrCodeCard(props),
}))

const networkMock = useNetworkStatus as jest.Mock
const offlinePackageMock = useOfflinePackage as jest.Mock
const qrTokenMock = useQrToken as jest.Mock
const presentationMock = createOfflinePresentation as jest.Mock
const keyBindingFrameMock = useKeyBindingFrame as jest.Mock
const generateMock = jest.fn()
const dismissToMock = jest.fn()
const resetTokenMock = jest.fn()

const CREDENTIAL_ID = 'c-1'
const LICENCE_MANDATORY = ['Photo', 'Expiry date', 'Date of birth']
const OFFLINE_PACKAGE = {
  issuerSignedCredential: 'header.payload.signature',
  disclosures: {},
  signedAt: '2026-09-24T08:00:00Z',
  expiresAt: '2026-10-24T08:00:00Z',
}

const renderPage = () =>
  renderWithSafeArea(<QrGenerationPage credentialId={CREDENTIAL_ID} />)

describe('QrGenerationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ dismissTo: dismissToMock })
    ;(useCountdown as jest.Mock).mockReturnValue(60)
    ;(useWalletCredential as jest.Mock).mockReturnValue({
      credential: {
        id: CREDENTIAL_ID,
        title: "Driver's Licence",
        type: 'DriversLicense',
      },
      isPending: false,
    })
    ;(isPackageUsable as jest.Mock).mockReturnValue(true)
    networkMock.mockReturnValue({ isOffline: false, isOnline: true })
    offlinePackageMock.mockReturnValue({
      offlinePackage: OFFLINE_PACKAGE,
      isPreparing: false,
    })
    qrTokenMock.mockReturnValue({
      error: null,
      generate: generateMock,
      isGenerating: false,
      reset: resetTokenMock,
      token: null,
    })
    presentationMock.mockReturnValue('presentation')
    keyBindingFrameMock.mockReturnValue(null)
  })

  it('Should request an online code with the mandatory and chosen fields when online', async () => {
    await renderPage()

    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    expect(generateMock).toHaveBeenCalledWith({
      credentialId: CREDENTIAL_ID,
      disclosedFields: [...LICENCE_MANDATORY, 'License number'],
    })
    expect(presentationMock).not.toHaveBeenCalled()
  })

  it('Should show an offline code instead of requesting an online one when offline', async () => {
    networkMock.mockReturnValue({ isOffline: true, isOnline: false })
    await renderPage()

    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    expect(generateMock).not.toHaveBeenCalled()
    expect(presentationMock).toHaveBeenCalledWith(OFFLINE_PACKAGE, [
      ...LICENCE_MANDATORY,
      'License number',
    ])
    expect(screen.getByTestId('offline-qr-card')).toBeTruthy()
    expect(screen.getByText('2 frames')).toBeTruthy()
  })

  it('Should rebuild the offline code with the new fields when the selection changes offline', async () => {
    networkMock.mockReturnValue({ isOffline: true, isOnline: false })
    await renderPage()
    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    await fireEvent.press(screen.getByTestId('qr-edit-disclosure-button'))
    await fireEvent.press(screen.getByTestId('mock-share-mandatory-only'))

    expect(presentationMock).toHaveBeenLastCalledWith(
      OFFLINE_PACKAGE,
      LICENCE_MANDATORY
    )
    expect(generateMock).not.toHaveBeenCalled()
  })

  it('Should request a fresh online code with the same fields when switching back online', async () => {
    await renderPage()
    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))
    await fireEvent.press(screen.getByTestId('show-offline-button'))
    expect(screen.getByTestId('offline-qr-card')).toBeTruthy()

    await fireEvent.press(screen.getByTestId('show-online-button'))

    expect(generateMock).toHaveBeenCalledTimes(2)
    expect(generateMock).toHaveBeenLastCalledWith({
      credentialId: CREDENTIAL_ID,
      disclosedFields: [...LICENCE_MANDATORY, 'License number'],
    })
    expect(screen.queryByTestId('offline-qr-card')).toBeNull()
  })

  it('Should not request an online code when switching back before any fields were chosen', async () => {
    await renderPage()
    await fireEvent.press(screen.getByTestId('show-offline-button'))

    await fireEvent.press(screen.getByTestId('show-online-button'))

    expect(generateMock).not.toHaveBeenCalled()
    expect(screen.getByTestId('qr-empty')).toBeTruthy()
  })

  it('Should ask to connect once when no offline package is on the phone', async () => {
    offlinePackageMock.mockReturnValue({
      offlinePackage: null,
      isPreparing: false,
    })
    await renderPage()

    await fireEvent.press(screen.getByTestId('show-offline-button'))

    expect(
      screen.getByText('Connect once to prepare offline verification.')
    ).toBeTruthy()
    expect(screen.queryByTestId('offline-qr-card')).toBeNull()
  })

  it('Should say the offline code is being prepared while the package downloads', async () => {
    offlinePackageMock.mockReturnValue({
      offlinePackage: null,
      isPreparing: true,
    })
    await renderPage()

    await fireEvent.press(screen.getByTestId('show-offline-button'))

    expect(
      screen.getByText('Preparing your offline code. Try again in a moment.')
    ).toBeTruthy()
  })

  it('Should return to the credential list when going back', async () => {
    await renderPage()

    await fireEvent.press(screen.getByTestId('detail-back-button'))

    expect(dismissToMock).toHaveBeenCalledWith('/citizen/wallet')
  })

  it('Should stop showing the previous offline code when rebuilding it fails', async () => {
    networkMock.mockReturnValue({ isOffline: true, isOnline: false })
    await renderPage()
    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))
    expect(screen.getByTestId('offline-qr-card')).toBeTruthy()
    presentationMock.mockImplementationOnce(() => {
      throw new Error('Offline claim is not cached: portrait')
    })

    await fireEvent.press(screen.getByTestId('qr-edit-disclosure-button'))
    await fireEvent.press(screen.getByTestId('mock-share-mandatory-only'))

    expect(screen.queryByTestId('offline-qr-card')).toBeNull()
    expect(
      screen.getByText(
        'Your offline code could not be prepared. Connect to the internet and open Share again.'
      )
    ).toBeTruthy()
    expect(screen.queryByText(/portrait/)).toBeNull()
  })

  it('Should clear the online code for the old selection when the fields change', async () => {
    await renderPage()

    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    expect(resetTokenMock).toHaveBeenCalledTimes(1)
  })

  it('Should hide Show offline code while the offline code is showing', async () => {
    await renderPage()
    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    await fireEvent.press(screen.getByTestId('show-offline-button'))

    expect(screen.getByTestId('offline-qr-card')).toBeTruthy()
    expect(screen.queryByTestId('show-offline-button')).toBeNull()
  })

  it('Should add the signed key binding frame to the offline code', async () => {
    keyBindingFrameMock.mockReturnValue('FID1:K:abcdef:kb')
    networkMock.mockReturnValue({ isOffline: true, isOnline: false })
    await renderPage()

    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    expect(screen.getByText('3 frames')).toBeTruthy()
  })

  it('Should not ask for key binding when the credential is not bound to this phone', async () => {
    networkMock.mockReturnValue({ isOffline: true, isOnline: false })
    await renderPage()

    await fireEvent.press(screen.getByTestId('mock-share-licence-number'))

    expect(keyBindingFrameMock).toHaveBeenLastCalledWith(null)
  })
})
