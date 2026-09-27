import * as Crypto from 'expo-crypto'
import { base64urlnopad } from '@scure/base'

export const PAYLOAD_FRAME_PREFIX = 'FID1:P'
export const PAYLOAD_FRAME_SIZE = 450
export const PRESENTATION_ID_BYTES = 4

export type PayloadFrame = {
  chunk: string
  encoded: string
  index: number
  tid: string
  total: number
}

export const createPresentationId = (): string =>
  base64urlnopad.encode(Crypto.getRandomBytes(PRESENTATION_ID_BYTES))

const validatePresentation = (presentation: string): void => {
  if (!presentation) {
    throw new Error('The presentation cannot be empty.')
  }
}

const validateFrameSize = (frameSize: number): void => {
  if (!Number.isInteger(frameSize) || frameSize <= 0) {
    throw new Error('The frame size must be a positive integer.')
  }
}

export const splitPayloadFrames = (
  presentation: string,
  tid = createPresentationId(),
  frameSize = PAYLOAD_FRAME_SIZE
): readonly PayloadFrame[] => {
  validatePresentation(presentation)
  validateFrameSize(frameSize)

  if (!/^[A-Za-z0-9_-]{6}$/.test(tid)) {
    throw new Error(
      'The presentation id must be a 6-character base64url value.'
    )
  }

  const chunks = Array.from(
    { length: Math.ceil(presentation.length / frameSize) },
    (_, index) => presentation.slice(index * frameSize, (index + 1) * frameSize)
  )

  const total = chunks.length

  return chunks.map((chunk, index) => {
    const encoded = `${PAYLOAD_FRAME_PREFIX}:${tid}:${index}/${total}:${chunk}`

    return {
      chunk,
      encoded,
      index,
      tid,
      total,
    }
  })
}

export const KEY_BINDING_FRAME_PREFIX = 'FID1:K'

// Wire-format section 9: one K frame after every third P frame, so a camera that starts mid-cycle
// meets a fresh signature within half a second at 8 fps.
const PAYLOAD_FRAMES_PER_KEY_BINDING_FRAME = 3

export const encodeKeyBindingFrame = (
  tid: string,
  keyBindingJwt: string
): string => `${KEY_BINDING_FRAME_PREFIX}:${tid}:${keyBindingJwt}`

export const interleaveKeyBindingFrame = (
  payloadFrames: readonly string[],
  keyBindingFrame: string
): readonly string[] =>
  payloadFrames.flatMap((frame, index) =>
    // The last payload frame always gets one too, so a code shorter than three frames still carries it.
    (index + 1) % PAYLOAD_FRAMES_PER_KEY_BINDING_FRAME === 0 ||
    index === payloadFrames.length - 1
      ? [frame, keyBindingFrame]
      : [frame]
  )
