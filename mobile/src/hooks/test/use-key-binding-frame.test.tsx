import { act, renderHook } from '@testing-library/react-native'
import { base64urlnopad } from '@scure/base'

import { loadDeviceSigner } from '@/lib/offline/device-key'

import { useKeyBindingFrame } from '../use-key-binding-frame'

jest.mock('@/lib/offline/device-key', () => ({ loadDeviceSigner: jest.fn() }))

const loadSignerMock = loadDeviceSigner as jest.Mock
const signMock = jest.fn(() => new Uint8Array(64))

const SOURCE = { sdJwt: 'issuer.jwt.signature~disclosure~', tid: 'abcdef' }
const START_MS = 1_790_000_000_000

const iatOf = (frame: string | null) =>
  JSON.parse(
    new TextDecoder().decode(
      base64urlnopad.decode(frame!.split(':')[3].split('.')[1])
    )
  ).iat

const flushSigner = () => act(async () => {})

describe('useKeyBindingFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(START_MS)
    loadSignerMock.mockResolvedValue(signMock)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('Should show no frame when the credential is not bound', async () => {
    const { result } = await renderHook(() => useKeyBindingFrame(null))

    expect(result.current.frame).toBeNull()
    expect(loadSignerMock).not.toHaveBeenCalled()
  })

  it('Should sign a K frame for the presentation once the device key loads', async () => {
    const { result } = await renderHook(() => useKeyBindingFrame(SOURCE))
    await flushSigner()

    expect(result.current.frame).toMatch(/^FID1:K:abcdef:/)
    expect(iatOf(result.current.frame)).toBe(START_MS / 1000)
  })

  it('Should re-sign every five seconds with a fresh iat', async () => {
    const { result } = await renderHook(() => useKeyBindingFrame(SOURCE))
    await flushSigner()

    await act(async () => {
      jest.advanceTimersByTime(5000)
    })

    expect(iatOf(result.current.frame)).toBe(START_MS / 1000 + 5)
    expect(loadSignerMock).toHaveBeenCalledTimes(1)
  })

  it('Should never show a frame signed for an earlier presentation', async () => {
    const { result, rerender } = await renderHook(
      ({ source }: { source: typeof SOURCE }) => useKeyBindingFrame(source),
      { initialProps: { source: SOURCE } }
    )
    await flushSigner()
    loadSignerMock.mockReturnValueOnce(new Promise(() => {}))

    await rerender({ source: { sdJwt: 'other~', tid: 'ghijkl' } })

    expect(result.current.frame).toBeNull()
  })

  it('Should stop signing once the code closes', async () => {
    const { unmount } = await renderHook(() => useKeyBindingFrame(SOURCE))
    await flushSigner()
    const signedBefore = signMock.mock.calls.length

    await act(async () => unmount())
    await act(async () => {
      jest.advanceTimersByTime(15000)
    })

    expect(signMock).toHaveBeenCalledTimes(signedBefore)
  })

  it("Should report the code as unavailable when the device key can't be loaded", async () => {
    loadSignerMock.mockRejectedValue(new Error('secure store unavailable'))

    const { result } = await renderHook(() => useKeyBindingFrame(SOURCE))
    await flushSigner()

    expect(result.current.frame).toBeNull()
    expect(result.current.isUnavailable).toBe(true)
  })
})
