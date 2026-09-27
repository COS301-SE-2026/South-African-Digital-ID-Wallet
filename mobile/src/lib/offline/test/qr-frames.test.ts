import {
  createPresentationId,
  PAYLOAD_FRAME_SIZE,
  splitPayloadFrames,
} from '../qr-frames'

describe('createPresentationId', () => {
  it('creates a six-character base64url presentation id', () => {
    expect(createPresentationId()).toMatch(/^[A-Za-z0-9_-]{6}$/)
  })
})

describe('splitPayloadFrames', () => {
  it('splits a presentation into numbered payload frames', () => {
    const presentation = 'a'.repeat(901)

    const frames = splitPayloadFrames(presentation, 'abcdefgh'.slice(0, 6))

    expect(frames).toHaveLength(3)
    expect(frames[0]).toEqual({
      chunk: 'a'.repeat(450),
      encoded: `FID1:P:abcdef:0/3:${'a'.repeat(450)}`,
      index: 0,
      tid: 'abcdef',
      total: 3,
    })
    expect(frames[1].index).toBe(1)
    expect(frames[2].chunk).toBe('a')
  })

  it('keeps each payload chunk within the configured size', () => {
    const presentation = 'credential'.repeat(200)

    const frames = splitPayloadFrames(presentation, 'abcdef', 100)

    expect(frames.every((frame) => frame.chunk.length <= 100)).toBe(true)
    expect(frames.every((frame) => frame.total === frames.length)).toBe(true)
  })

  it('creates one frame for a presentation shorter than the frame size', () => {
    const presentation = 'short-presentation'

    const frames = splitPayloadFrames(presentation, 'abcdef')

    expect(frames).toHaveLength(1)
    expect(frames[0].encoded).toBe(`FID1:P:abcdef:0/1:${presentation}`)
  })

  it('uses the wire-format default of 450 characters per frame', () => {
    const presentation = 'x'.repeat(PAYLOAD_FRAME_SIZE + 1)

    const frames = splitPayloadFrames(presentation, 'abcdef')

    expect(frames).toHaveLength(2)
    expect(frames[0].chunk).toHaveLength(PAYLOAD_FRAME_SIZE)
  })

  it('rejects an empty presentation', () => {
    expect(() => splitPayloadFrames('', 'abcdef')).toThrow(
      'The presentation cannot be empty.'
    )
  })

  it('rejects an invalid presentation id', () => {
    expect(() => splitPayloadFrames('presentation', 'bad')).toThrow(
      'The presentation id must be a 6-character base64url value.'
    )
  })

  it('rejects an invalid frame size', () => {
    expect(() => splitPayloadFrames('presentation', 'abcdef', 0)).toThrow(
      'The frame size must be a positive integer.'
    )
  })
})
