import { PAYLOAD_FRAME_SIZE } from './qr-frames'

const PAYLOAD_FRAME_PATTERN =
  /^FID1:P:([A-Za-z0-9_-]{6}):(\d+)\/(\d+):([A-Za-z0-9._~-]+)$/
// A compact JWS: exactly three base64url segments.
const KEY_BINDING_FRAME_PATTERN =
  /^FID1:K:([A-Za-z0-9_-]{6}):([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/

export const MAX_PAYLOAD_FRAMES = 64
export const MAX_PAYLOAD_LENGTH = MAX_PAYLOAD_FRAMES * PAYLOAD_FRAME_SIZE
// A FlashID Key Binding JWT is about 250 characters, so anything far larger was not made by the wallet.
const MAX_KEY_BINDING_LENGTH = 1024

export type AccumulatedPayload = {
  complete: boolean
  received: number
  missingIndexes: readonly number[]
  // The SD-JWT rebuilt from the payload frames, once every one has arrived.
  presentation: string | null
  keyBindingJwt: string | null
  tid: string | null
  total: number
}

type PayloadFrame = {
  kind: 'payload'
  chunk: string
  index: number
  tid: string
  total: number
}

type KeyBindingFrame = {
  kind: 'keyBinding'
  keyBindingJwt: string
  tid: string
}

export class PayloadFrameAccumulator {
  private readonly frames = new Map<number, PayloadFrame>()

  private keyBindingJwt: string | null = null

  private tid: string | null = null

  private total = 0

  add(encodedFrame: string): AccumulatedPayload {
    const parsed = this.parse(encodedFrame)

    // A new presentation id means the citizen made a new code, so everything collected is dropped.
    if (this.tid !== parsed.tid) {
      this.startPresentation(parsed.tid)
    }

    if (parsed.kind === 'keyBinding') {
      // Newest wins: the wallet re-signs every 5 seconds and only the latest is fresh (wire-format section 9).
      this.keyBindingJwt = parsed.keyBindingJwt

      return this.getSnapshot()
    }

    // A K frame can arrive first, before the total is known, so 0 means "not yet known".
    if (this.total !== 0 && this.total !== parsed.total) {
      throw new Error('Payload frame total changed for the same presentation.')
    }

    this.total = parsed.total

    if (!this.frames.has(parsed.index)) {
      this.frames.set(parsed.index, parsed)
    }

    return this.getSnapshot()
  }

  reset(): void {
    this.startPresentation(null)
  }

  getSnapshot(): AccumulatedPayload {
    const missingIndexes = Array.from(
      { length: this.total },
      (_, index) => index
    ).filter((index) => !this.frames.has(index))
    const complete = this.total > 0 && missingIndexes.length === 0

    return {
      complete,
      received: this.frames.size,
      missingIndexes,
      presentation: complete
        ? Array.from(this.frames.values())
            .sort((left, right) => left.index - right.index)
            .map((frame) => frame.chunk)
            .join('')
        : null,
      keyBindingJwt: this.keyBindingJwt,
      tid: this.tid,
      total: this.total,
    }
  }

  private startPresentation(tid: string | null): void {
    this.frames.clear()
    this.keyBindingJwt = null
    this.tid = tid
    this.total = 0
  }

  private parse(encodedFrame: string): PayloadFrame | KeyBindingFrame {
    const keyBinding = KEY_BINDING_FRAME_PATTERN.exec(encodedFrame)

    if (keyBinding) {
      const [, tid, keyBindingJwt] = keyBinding

      if (keyBindingJwt.length > MAX_KEY_BINDING_LENGTH) {
        throw new Error('Invalid offline key binding frame.')
      }

      return { kind: 'keyBinding', keyBindingJwt, tid }
    }

    const match = PAYLOAD_FRAME_PATTERN.exec(encodedFrame)

    if (!match) {
      throw new Error('Invalid offline payload frame.')
    }

    const [, tid, indexText, totalText, chunk] = match
    const index = Number(indexText)
    const total = Number(totalText)

    if (
      !Number.isInteger(index) ||
      !Number.isInteger(total) ||
      total < 1 ||
      total > MAX_PAYLOAD_FRAMES ||
      index < 0 ||
      index >= total ||
      chunk.length > PAYLOAD_FRAME_SIZE
    ) {
      throw new Error('Invalid offline payload frame indexes.')
    }

    return { kind: 'payload', chunk, index, tid, total }
  }
}
