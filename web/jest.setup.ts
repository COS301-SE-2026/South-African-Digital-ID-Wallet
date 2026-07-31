import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'node:util'
;(globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder ??=
  TextDecoder
globalThis.TextEncoder ??= TextEncoder

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverMock as unknown as typeof ResizeObserver
