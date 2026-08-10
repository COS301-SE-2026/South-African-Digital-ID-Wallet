import { render, screen, waitFor } from '@testing-library/react'
import QrScanner from 'qr-scanner'
import { QrCameraScanner } from '../qr-camera-scanner'

jest.mock('qr-scanner')

const MockedQrScanner = QrScanner as jest.MockedClass<typeof QrScanner>

describe('QrCameraScanner', () => {
  let startMock: jest.Mock
  let stopMock: jest.Mock
  let destroyMock: jest.Mock
  let pauseMock: jest.Mock
  let hasFlashMock: jest.Mock
  let getUserMediaMock: jest.Mock
  let trackStopMock: jest.Mock
  let onDecodeCallback: (result: { data: string }) => void

  beforeEach(() => {
    startMock = jest.fn().mockResolvedValue(undefined)
    stopMock = jest.fn()
    destroyMock = jest.fn()
    pauseMock = jest.fn()
    hasFlashMock = jest.fn().mockResolvedValue(false)
    trackStopMock = jest.fn()

    getUserMediaMock = jest
      .fn()
      .mockResolvedValue({ getTracks: () => [{ stop: trackStopMock }] })

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: getUserMediaMock },
    })

    MockedQrScanner.mockImplementation((_video, onDecode) => {
      onDecodeCallback = onDecode as unknown as (result: {
        data: string
      }) => void
      return {
        start: startMock,
        stop: stopMock,
        destroy: destroyMock,
        pause: pauseMock,
        hasFlash: hasFlashMock,
        toggleFlash: jest.fn().mockResolvedValue(undefined),
        inFlashOn: jest.fn().mockReturnValue(false),
      } as unknown as QrScanner
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('requesting camera access on mount', async () => {
    render(<QrCameraScanner onScan={() => {}} />)
    await waitFor(() => expect(startMock).toHaveBeenCalled())
  })

  it('calls onScan with the decoded text once a code is read', async () => {
    const onScan = jest.fn()
    render(<QrCameraScanner onScan={onScan} />)
    await waitFor(() => expect(startMock).toHaveBeenCalled())

    onDecodeCallback({ data: 'scanned-token-value' })

    expect(onScan).toHaveBeenCalledWith('scanned-token-value')
  })

  it('shows a message when camera access is denied', async () => {
    const deniedError = new Error('denied')
    deniedError.name = 'NotAllowedError'
    getUserMediaMock.mockRejectedValue(deniedError)

    render(<QrCameraScanner onScan={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText(/camera access was denied/i)).toBeInTheDocument()
    })
  })

  it('shows a message when no camera is available', async () => {
    getUserMediaMock.mockRejectedValue(new Error('no camera'))

    render(<QrCameraScanner onScan={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText(/camera could not be found/i)).toBeInTheDocument()
    })
  })

  it('stops and destroys the scanner on unmount', async () => {
    const { unmount } = render(<QrCameraScanner onScan={() => {}} />)
    await waitFor(() => expect(startMock).toHaveBeenCalled())

    unmount()

    expect(stopMock).toHaveBeenCalledTimes(1)
    expect(destroyMock).toHaveBeenCalledTimes(1)
  })

  it('pauses the scanner when paused is true', async () => {
    const onScan = () => {}
    const { rerender } = render(<QrCameraScanner onScan={onScan} />)
    await waitFor(() => expect(startMock).toHaveBeenCalled())

    rerender(<QrCameraScanner onScan={onScan} paused />)

    await waitFor(() => expect(pauseMock).toHaveBeenCalled())
  })
})
