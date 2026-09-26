import { useCallback, useRef, useState } from 'react'

import { requiresKeyBinding } from '@/lib/offline/key-binding'
import {
  PayloadFrameAccumulator,
  type AccumulatedPayload,
} from '@/lib/offline/qr-frame-accumulator'
import {
  verifyPresentation,
  type TrustData,
  type VerificationResult,
} from '@/lib/offline/verify'

export type OfflineScanProgress = { received: number; total: number }

// Longer than one full cycle of a licence code with its K frames (28 frames at 8 fps is 3.5 s), so a K
// frame that exists has certainly been shown before the scanner stops waiting for it.
const KEY_BINDING_WAIT_MS = 4000

type KeyBindingWait = { tid: string | null; since: number }

const isAwaitingKeyBinding = (snapshot: AccumulatedPayload): boolean =>
  snapshot.complete &&
  snapshot.presentation !== null &&
  snapshot.keyBindingJwt === null &&
  requiresKeyBinding(snapshot.presentation)

export const useOfflineScan = (
  trust: TrustData | null,
  isTrustLoading = false,
  // Told about each result once, for example to queue it for the audit log.
  onResult?: (result: VerificationResult) => void
) => {
  // useState's lazy initialiser builds the accumulator on the first render only, never again.
  const [accumulator] = useState(() => new PayloadFrameAccumulator())
  const [progress, setProgress] = useState<OfflineScanProgress | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)
  // A ref, not state: it only decides what to do with the next frame and never changes what is shown.
  const keyBindingWait = useRef<KeyBindingWait | null>(null)

  const addFrame = useCallback(
    (rawText: string) => {
      // The camera keeps reading the same code until the result screen replaces it, so later
      // frames are ignored rather than collected and verified a second time.
      if (result) {
        return
      }

      let snapshot: AccumulatedPayload

      try {
        snapshot = accumulator.add(rawText)
      } catch {
        // A misread frame is skipped: the display cycles, so the same frame comes round again.
        return
      }

      const now = Date.now()

      // A bound code whose K frame never arrives (the wallet could not load its key, or a recording was
      // cropped) is verified anyway after the wait, so the officer gets MISSING_KEY_BINDING rather than
      // a scanner stuck at N of N.
      if (!isAwaitingKeyBinding(snapshot)) {
        keyBindingWait.current = null
      } else if (keyBindingWait.current?.tid !== snapshot.tid) {
        keyBindingWait.current = { tid: snapshot.tid, since: now }
      }

      const isStillWaiting =
        keyBindingWait.current !== null &&
        now - keyBindingWait.current.since < KEY_BINDING_WAIT_MS

      if (
        !snapshot.complete ||
        !snapshot.presentation ||
        isStillWaiting ||
        isTrustLoading
      ) {
        setProgress({ received: snapshot.received, total: snapshot.total })
        return
      }

      accumulator.reset()
      keyBindingWait.current = null
      setProgress(null)

      const verification: VerificationResult = trust
        ? verifyPresentation(
            `${snapshot.presentation}${snapshot.keyBindingJwt ?? ''}`,
            trust,
            { now: Math.floor(now / 1000) }
          )
        : { ok: false, code: 'STALE_TRUST_DATA', warnings: [] }

      setResult(verification)
      onResult?.(verification)
    },
    [accumulator, isTrustLoading, onResult, result, trust]
  )

  const reset = useCallback(() => {
    accumulator.reset()
    keyBindingWait.current = null
    setProgress(null)
    setResult(null)
  }, [accumulator])

  return { addFrame, progress, reset, result }
}
