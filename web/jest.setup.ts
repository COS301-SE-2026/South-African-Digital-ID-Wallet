import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'node:util'
;(globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder ??=
  TextDecoder
globalThis.TextEncoder ??= TextEncoder
