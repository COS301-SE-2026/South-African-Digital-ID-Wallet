import { act, render, screen } from '@testing-library/react-native'
import QRCode from 'react-native-qrcode-svg'

import { QrCodeCard } from '../qr-code-card'

jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('@/components/molecules', () => ({
  CountdownRing: () => null,
}))

const qrCodeMock = QRCode as unknown as jest.Mock

const baseProps = {
  onCancel: jest.fn(),
  onRefresh: jest.fn(),
  secondsRemaining: 60,
}

describe('<QrCodeCard/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the online token by default', async () => {
    await render(<QrCodeCard {...baseProps} token="online-token" />)

    expect(qrCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'online-token',
      }),
      undefined
    )
    expect(screen.queryByTestId('offline-frame-status')).toBeNull()
  })

  it('renders the first offline frame initially', async () => {
    await render(
      <QrCodeCard
        {...baseProps}
        offlineFrames={['FID1:P:abcdef:0/2:first', 'FID1:P:abcdef:1/2:second']}
      />
    )

    expect(qrCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'FID1:P:abcdef:0/2:first',
      }),
      undefined
    )
    expect(screen.getByText('Frame 1 of 2')).toBeTruthy()
  })

  it('changes the offline frame eight times per second', async () => {
    await render(
      <QrCodeCard {...baseProps} offlineFrames={['frame-one', 'frame-two']} />
    )

    await act(async () => {
      jest.advanceTimersByTime(125)
    })

    expect(qrCodeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 'frame-two',
      }),
      undefined
    )
    expect(screen.getByText('Frame 2 of 2')).toBeTruthy()
  })

  it('cycles back to the first frame after the final frame', async () => {
    await render(
      <QrCodeCard {...baseProps} offlineFrames={['frame-one', 'frame-two']} />
    )

    await act(async () => {
      jest.advanceTimersByTime(250)
    })

    expect(qrCodeMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        value: 'frame-one',
      }),
      undefined
    )
    expect(screen.getByText('Frame 1 of 2')).toBeTruthy()
  })

  it('does not show the online expiry overlay for offline frames', async () => {
    await render(
      <QrCodeCard
        {...baseProps}
        offlineFrames={['offline-frame']}
        secondsRemaining={0}
      />
    )

    expect(screen.queryByTestId('qr-expired-overlay')).toBeNull()
    expect(screen.getByTestId('offline-frame-status')).toBeTruthy()
  })

  it('stops cycling after unmount', async () => {
    const { unmount } = await render(
      <QrCodeCard {...baseProps} offlineFrames={['frame-one', 'frame-two']} />
    )

    await unmount()

    await act(async () => {
      jest.advanceTimersByTime(125)
    })

    expect(qrCodeMock).toHaveBeenCalledTimes(1)
  })

  it('hides the countdown in offline mode', async () => {
    await render(
      <QrCodeCard {...baseProps} offlineFrames={['DID1:P:abcdef:0/1:only ']} />
    )

    expect(screen.queryByText('This code expires in')).toBeNull()
  })
})
