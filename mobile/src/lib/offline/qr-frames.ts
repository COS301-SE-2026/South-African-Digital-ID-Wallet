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
