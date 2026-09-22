import { PayloadFrameAccumulator } from '../qr-frame-accumulator'
import { splitPayloadFrames } from '../qr-frames'

describe('PayloadFrameAccumulator', () => {
  it('reassembles frames received out of order', () => {
    const frames = splitPayloadFrames('a'.repeat(901), 'abcdef')
    const accumulator = new PayloadFrameAccumulator()

    accumulator.add(frames[2].encoded)
    accumulator.add(frames[0].encoded)
    const result = accumulator.add(frames[1].encoded)

    expect(result.complete).toBe(true)
    expect(result.received).toBe(3)
    expect(result.missingIndexes).toEqual([])
    expect(result.presentation).toBe('a'.repeat(901))
  })

  it('does not count duplicate frames twice', () => {
    const frames = splitPayloadFrames('a'.repeat(901), 'abcdef')
    const accumulator = new PayloadFrameAccumulator()

    accumulator.add(frames[0].encoded)
    const result = accumulator.add(frames[0].encoded)

    expect(result.received).toBe(1)
    expect(result.complete).toBe(false)
    expect(result.missingIndexes).toEqual([1, 2])
  })

  it('reports missing frame indexes while incomplete', () => {
    const frames = splitPayloadFrames('a'.repeat(901), 'abcdef')
    const accumulator = new PayloadFrameAccumulator()

    const result = accumulator.add(frames[1].encoded)

    expect(result.complete).toBe(false)
    expect(result.received).toBe(1)
    expect(result.missingIndexes).toEqual([0, 2])
    expect(result.presentation).toBeNull()
  })

  it('resets collected frames when a new presentation id arrives', () => {
    const first = splitPayloadFrames('first', 'abcdef')
    const second = splitPayloadFrames('second', 'ghijkl')
    const accumulator = new PayloadFrameAccumulator()

    accumulator.add(first[0].encoded)
    const result = accumulator.add(second[0].encoded)

    expect(result.tid).toBe('ghijkl')
    expect(result.received).toBe(1)
    expect(result.total).toBe(1)
    expect(result.complete).toBe(true)
    expect(result.presentation).toBe('second')
  })

  it('reassembles a single-frame presentation', () => {
    const accumulator = new PayloadFrameAccumulator()

    const result = accumulator.add('FID1:P:abcdef:0/1:credential')

    expect(result).toEqual({
      complete: true,
      received: 1,
      missingIndexes: [],
      presentation: 'credential',
      tid: 'abcdef',
      total: 1,
    })
  })

  it('resets its state explicitly', () => {
    const accumulator = new PayloadFrameAccumulator()

    accumulator.add('FID1:P:abcdef:0/1:credential')
    accumulator.reset()

    expect(accumulator.getSnapshot()).toEqual({
      complete: false,
      received: 0,
      missingIndexes: [],
      presentation: null,
      tid: null,
      total: 0,
    })
  })

  it.each([
    'not-a-frame',
    'FID1:K:abcdef:token',
    'FID1:P:bad:0/1:credential',
    'FID1:P:abcdef:1/1:credential',
  ])('rejects malformed frame %s', (frame) => {
    const accumulator = new PayloadFrameAccumulator()

    expect(() => accumulator.add(frame)).toThrow()
  })

  it('rejects payloads exceeding the frame limit', () => {
    const accumulator = new PayloadFrameAccumulator()

    expect(() => accumulator.add('FID1:P:abcdef:0/65:credential')).toThrow(
      'Invalid offline payload frame indexes.'
    )
  })
})
