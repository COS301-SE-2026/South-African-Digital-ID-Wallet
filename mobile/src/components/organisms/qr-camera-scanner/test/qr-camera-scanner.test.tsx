import { fireEvent, render, screen } from '@testing-library/react-native'
import { Linking } from 'react-native'
import { useCameraPermissions } from 'expo-camera'

import { QrCameraScanner } from '../qr-camera-scanner'

const mockCameraProps = jest.fn()

jest.mock('expo-camera', () => ({
  CameraView: (props: Record<string, unknown>) => mockCameraProps(props),
  useCameraPermissions: jest.fn(),
}))

const permissionsMock = useCameraPermissions as jest.Mock
const requestPermission = jest.fn()
const getPermission = jest.fn()

const setPermission = (permission: unknown) =>
  permissionsMock.mockReturnValue([
    permission,
    requestPermission,
    getPermission,
  ])

const GRANTED = { canAskAgain: true, granted: true, status: 'granted' }
const DENIED_RETRY = { canAskAgain: true, granted: false, status: 'denied' }
const DENIED_FINAL = { canAskAgain: false, granted: false, status: 'denied' }

describe('<QrCameraScanner/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCameraProps.mockReturnValue(null)
  })

  it('Should show a spinner until the permission is known', async () => {
    setPermission(null)
    await render(<QrCameraScanner onScan={jest.fn()} />)
    expect(screen.getByText('Preparing the camera...')).toBeTruthy()
  })

  it('Should auto-request an undetermined permission', async () => {
    setPermission({ canAskAgain: true, granted: false, status: 'undetermined' })
    await render(<QrCameraScanner onScan={jest.fn()} />)
    expect(requestPermission).toHaveBeenCalledTimes(1)
  })

  it('Should offer a retry while the user can still be asked', async () => {
    setPermission(DENIED_RETRY)
    await render(<QrCameraScanner onScan={jest.fn()} />)
    expect(screen.getByTestId('qr-camera-denied')).toBeTruthy()
    await fireEvent.press(screen.getByTestId('qr-camera-permission-button'))
    expect(requestPermission).toHaveBeenCalled()
  })

  it('Should send the user to settings once permission is permanently off', async () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue()
    setPermission(DENIED_FINAL)
    await render(<QrCameraScanner onScan={jest.fn()} />)
    expect(screen.getByText(/ turned off for FlashID/)).toBeTruthy()
    await fireEvent.press(screen.getByTestId('qr-camera-permission-button'))
    expect(openSettings).toHaveBeenCalled()
    openSettings.mockRestore()
  })

  it('Should render the camera once granted', async () => {
    setPermission(GRANTED)
    await render(<QrCameraScanner onScan={jest.fn()} />)
    expect(mockCameraProps).toHaveBeenCalledWith(
      expect.objectContaining({
        barcodeScannerSettings: { barcodeTypes: ['qr'] },
      })
    )
  })

  it('Should forward a scanned code exactly once', async () => {
    const onScan = jest.fn()
    setPermission(GRANTED)
    await render(<QrCameraScanner onScan={onScan} />)
    const { onBarcodeScanned } = mockCameraProps.mock.calls[0][0] as {
      onBarcodeScanned: (r: { data: string }) => void
    }
    onBarcodeScanned({ data: 'token-1' })
    onBarcodeScanned({ data: 'token-1' })
    expect(onScan).toHaveBeenCalledTimes(1)
    expect(onScan).toHaveBeenCalledWith('token-1')
  })

  it('Should detach the scan handler while paused', async () => {
    setPermission(GRANTED)
    await render(<QrCameraScanner onScan={jest.fn()} paused />)
    expect(mockCameraProps).toHaveBeenCalledWith(
      expect.objectContaining({ onBarcodeScanned: undefined })
    )
  })

  it('Should pass the torch flag through', async () => {
    setPermission(GRANTED)
    await render(<QrCameraScanner isTorchOn onScan={jest.fn()} />)
    expect(mockCameraProps).toHaveBeenCalledWith(
      expect.objectContaining({ enableTorch: true })
    )
  })
})
