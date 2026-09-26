import { PAYLOAD_FRAME_SIZE } from './qr-frames'

const FRAME_PATTERN =
  /^FID1:P:([A-Za-z0-9_-]{6}):(\d+)\/(\d+):([A-Za-z0-9._~-]+)$/

export const MAX_PAYLOAD_FRAMES = 64
export const MAX_PAYLOAD_LENGTH = MAX_PAYLOAD_FRAMES * PAYLOAD_FRAME_SIZE

export type AccumulatedPayload = {
  complete: boolean
  received: number
  missingIndexes: readonly number[]
  presentation: string | null
  tid: string | null
  total: number
}

type ParsedFrame = {
  chunk: string
  index: number
  tid: string
  total: number
}

const emptyState = (): AccumulatedPayload => ({
  complete: false,
  received: 0,
  missingIndexes: [],
  presentation: null,
  tid: null,
  total: 0,
})

export class PayloadFrameAccumulator {
  private frames = new Map<number, ParsedFrame>()

  private state: AccumulatedPayload = emptyState()

  add(encodedFrame: string): AccumulatedPayload {
    const parsed = this.parse(encodedFrame)

    if (this.state.tid !== null && this.state.tid !== parsed.tid) {
      this.frames.clear()
      this.state = emptyState()
    }

    if (this.state.tid === parsed.tid && this.state.total !== parsed.total) {
      throw new Error('Payload frame total changed for the same presentation.')
    }

    if (!this.frames.has(parsed.index)) {
      this.frames.set(parsed.index, parsed)
    }

    const missingIndexes = Array.from(
      { length: parsed.total },
      (_, index) => index
    ).filter((index) => !this.frames.has(index))

    const complete = missingIndexes.length === 0
    const presentation = complete
      ? Array.from(this.frames.values())
          .sort((left, right) => left.index - right.index)
          .map((frame) => frame.chunk)
          .join('')
      : null

    this.state = {
      complete,
      received: this.frames.size,
      missingIndexes,
      presentation,
      tid: parsed.tid,
      total: parsed.total,
    }

    return this.getSnapshot()
  }

  reset(): void {
    this.frames.clear()
    this.state = emptyState()
  }

  getSnapshot(): AccumulatedPayload {
    return {
      ...this.state,
      missingIndexes: [...this.state.missingIndexes],
    }
  }

  private parse(encodedFrame: string): ParsedFrame {
    const match = FRAME_PATTERN.exec(encodedFrame)

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

    return { chunk, index, tid, total }
  }
}
