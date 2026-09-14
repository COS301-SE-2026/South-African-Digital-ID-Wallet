import { act, renderHook } from '@testing-library/react-native'

import { useCountdown } from '../use-countdown'

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => jest.useRealTimers())

  it('Should return the whole seconds left until expiry', async () => {
    const { result } = await renderHook(() =>
      useCountdown('2026-01-01T00:01:00Z')
    )
    expect(result.current).toBe(60)
  })

  it('Should tick down once per second', async () => {
    const { result } = await renderHook(() =>
      useCountdown('2026-01-01T00:01:00Z')
    )
    await act(async () => {
      jest.advanceTimersByTime(5000)
    })
    expect(result.current).toBe(55)
  })

  it('Should never go negative past expiry', async () => {
    const { result } = await renderHook(() =>
      useCountdown('2026-01-01T00:00:05Z')
    )
    await act(async () => {
      jest.advanceTimersByTime(20000)
    })
    expect(result.current).toBe(0)
  })

  it('Should stay at zero and never tick without an expiry', async () => {
    const { result } = await renderHook(() => useCountdown(undefined))
    expect(result.current).toBe(0)
    await act(async () => {
      jest.advanceTimersByTime(10000)
    })
    expect(result.current).toBe(0)
  })

  it('Should treat an unparseable date as expired', async () => {
    const { result } = await renderHook(() => useCountdown('not-a-date'))
    expect(result.current).toBe(0)
  })
})
