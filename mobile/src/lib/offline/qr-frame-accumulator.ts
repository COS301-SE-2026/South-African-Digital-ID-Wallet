const FRAME_PATTERN = /^FID1:P:([A-Za-z0-9_-]{6}):(\d+)\/(\d+):(.+)$/

export const MAX_PAYLOAD_FRAMES = 64

export type AccumulatedPayload = {
  complete: boolean
  received: number
  missingIndexes: readonly number[]
  presentation: string | null
  tid: string | null
  total: number
}

type StoredFrame = {
  chunk: string
  index: number
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
  private frames = new Map<number, StoredFrame>()

  private state: AccumulatedPayload = emptyState()

  add(encodedFrame: string): AccumulatedPayload {
    const parsed = this.parse(encodedFrame)

    if (this.state.tid !== parsed.tid) {
      this.frames.clear()
      this.state = {
        complete: false,
        received: 0,
        missingIndexes: Array.from(
          { length: parsed.total },
          (_, index) => index
        ),
        presentation: null,
        tid: parsed.tid,
        total: parsed.total,
      }
    }

    if (!this.frames.has(parsed.index)) {
      this.frames.set(parsed.index, {
        chunk: parsed.chunk,
        index: parsed.index,
      })
    }

    const missingIndexes = Array.from(
      { length: parsed.total },
      (_, index) => index
    ).filter((index) => !this.frames.has(index))

    const complete = missingIndexes.length === 0

    this.state = {
      complete,
      received: this.frames.size,
      missingIndexes,
      presentation: complete
        ? Array.from(this.frames.values())
            .sort((left, right) => left.index - right.index)
            .map((frame) => frame.chunk)
            .join('')
        : null,
      tid: parsed.tid,
      total: parsed.total,
    }

    return this.state
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

  private parse(encodedFrame: string): {
    chunk: string
    index: number
    tid: string
    total: number
  } {
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
      index >= total
    ) {
      throw new Error('Invalid offline payload frame indexes.')
    }

    return { chunk, index, tid, total }
  }
}
