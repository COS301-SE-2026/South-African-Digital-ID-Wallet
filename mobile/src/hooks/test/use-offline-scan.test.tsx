import { act, renderHook } from '@testing-library/react-native'

import { splitPayloadFrames } from '@/lib/offline/qr-frames'
import { verifyPresentation, type TrustData } from '@/lib/offline/verify'

import { useOfflineScan } from '../use-offline-scan'

jest.mock('@/lib/offline/verify', () => ({
  verifyPresentation: jest.fn(),
}))

const verifyMock = verifyPresentation as jest.Mock

// 925 characters, so three payload frames at 450 characters each.
const PRESENTATION = `header.payload.signature~${'d'.repeat(900)}~`
const framesFor = (presentation: string, tid: string) =>
  splitPayloadFrames(presentation, tid).map((frame) => frame.encoded)

const trust: TrustData = {
  keys: [],
  retrievedAt: 1_790_000_000,
  revokedIndexes: [],
  revocationRetrievedAt: null,
}

const verified = {
  ok: true,
  vct: 'urn:flashid:drivers-license:1',
  revocationIndex: 1,
  claims: { full_name: 'Thabo Mokoena' },
  warnings: [],
}

describe('useOfflineScan', () => {
  beforeEach(() => {
    verifyMock.mockReset()
    verifyMock.mockReturnValue(verified)
  })

  it('Should report progress after the first frame', async () => {
    const { result } = await renderHook(() => useOfflineScan(trust))
    const frames = framesFor(PRESENTATION, 'abcdef')

    await act(async () => result.current.addFrame(frames[0]))

    expect(result.current.progress).toEqual({ received: 1, total: 3 })
    expect(result.current.result).toBeNull()
  })

  it('Should verify the reassembled presentation once every frame has arrived', async () => {
    const { result } = await renderHook(() => useOfflineScan(trust))
    const frames = framesFor(PRESENTATION, 'abcdef')

    // Out of order, as a camera reads them.
    for (const frame of [frames[2], frames[0], frames[1]]) {
      await act(async () => result.current.addFrame(frame))
    }

    expect(verifyMock).toHaveBeenCalledWith(PRESENTATION, trust, {
      now: expect.any(Number),
    })
    expect(result.current.result).toEqual(verified)
    expect(result.current.progress).toBeNull()
  })

  it('Should ignore a frame it cannot read', async () => {
    const { result } = await renderHook(() => useOfflineScan(trust))

    await act(async () => result.current.addFrame('FID1:P:not-a-frame'))

    expect(result.current.progress).toBeNull()
    expect(verifyMock).not.toHaveBeenCalled()
  })

  it('Should report stale trust data without verifying when the phone has none', async () => {
    const { result } = await renderHook(() => useOfflineScan(null))

    for (const frame of framesFor(PRESENTATION, 'abcdef')) {
      await act(async () => result.current.addFrame(frame))
    }

    expect(result.current.result).toEqual({
      ok: false,
      code: 'STALE_TRUST_DATA',
      warnings: [],
    })
    expect(verifyMock).not.toHaveBeenCalled()
  })

  it('Should start again when a new presentation begins', async () => {
    const { result } = await renderHook(() => useOfflineScan(trust))
    const shorter = `header.payload.signature~${'e'.repeat(500)}~`

    await act(async () =>
      result.current.addFrame(framesFor(PRESENTATION, 'abcdef')[0])
    )
    await act(async () =>
      result.current.addFrame(framesFor(shorter, 'ghijkl')[0])
    )

    expect(result.current.progress).toEqual({ received: 1, total: 2 })
  })

  it('Should clear progress and the result on reset', async () => {
    const { result } = await renderHook(() => useOfflineScan(trust))

    await act(async () =>
      result.current.addFrame(framesFor(PRESENTATION, 'abcdef')[0])
    )
    await act(async () => result.current.reset())

    expect(result.current.progress).toBeNull()
    expect(result.current.result).toBeNull()
  })

  it('Should wait for the verification data to load before verifying', async () => {
    const { result, rerender } = await renderHook(
      ({ isLoading }: { isLoading: boolean }) =>
        useOfflineScan(trust, isLoading),
      { initialProps: { isLoading: true } }
    )
    const frames = framesFor(PRESENTATION, 'abcdef')

    for (const frame of frames) {
      await act(async () => result.current.addFrame(frame))
    }

    expect(verifyMock).not.toHaveBeenCalled()
    expect(result.current.progress).toEqual({ received: 3, total: 3 })

    await rerender({ isLoading: false })
    await act(async () => result.current.addFrame(frames[0]))

    expect(verifyMock).toHaveBeenCalledTimes(1)
    expect(result.current.result).toEqual(verified)
  })

  it('Should ignore frames once a result is showing', async () => {
    const { result } = await renderHook(() => useOfflineScan(trust))
    const frames = framesFor(PRESENTATION, 'abcdef')

    for (const frame of [...frames, ...frames]) {
      await act(async () => result.current.addFrame(frame))
    }

    expect(verifyMock).toHaveBeenCalledTimes(1)
    expect(result.current.progress).toBeNull()
  })

  it('Should wait for the key binding frame when the credential is bound to a phone', async () => {
    const encodeJson = (value: unknown) =>
      Buffer.from(JSON.stringify(value)).toString('base64url')
    const bound = `${encodeJson({ alg: 'ES256' })}.${encodeJson({ cnf: { jwk: {} } })}.sig~${'d'.repeat(900)}~`
    const { result } = await renderHook(() => useOfflineScan(trust))

    for (const frame of framesFor(bound, 'abcdef')) {
      await act(async () => result.current.addFrame(frame))
    }

    expect(verifyMock).not.toHaveBeenCalled()

    await act(async () => result.current.addFrame('FID1:K:abcdef:kb.jwt.sig'))

    expect(verifyMock).toHaveBeenCalledWith(`${bound}kb.jwt.sig`, trust, {
      now: expect.any(Number),
    })
  })

  it('Should verify a bound code without its key binding frame once the wait is over', async () => {
    const encodeJson = (value: unknown) =>
      Buffer.from(JSON.stringify(value)).toString('base64url')
    const bound = `${encodeJson({ alg: 'ES256' })}.${encodeJson({ cnf: { jwk: {} } })}.sig~${'d'.repeat(900)}~`
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_790_000_000_000)
    const { result } = await renderHook(() => useOfflineScan(trust))
    const frames = framesFor(bound, 'abcdef')

    for (const frame of frames) {
      await act(async () => result.current.addFrame(frame))
    }

    expect(verifyMock).not.toHaveBeenCalled()

    nowSpy.mockReturnValue(1_790_000_004_001)
    await act(async () => result.current.addFrame(frames[0]))

    expect(verifyMock).toHaveBeenCalledWith(bound, trust, {
      now: expect.any(Number),
    })
    nowSpy.mockRestore()
  })
})
