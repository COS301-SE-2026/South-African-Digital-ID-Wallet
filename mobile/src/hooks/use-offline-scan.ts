import { useCallback, useState } from 'react'

import { PayloadFrameAccumulator } from '@/lib/offline/qr-frame-accumulator'
import {
  verifyPresentation,
  type TrustData,
  type VerificationResult,
} from '@/lib/offline/verify'

export type OfflineScanProgress = { received: number; total: number }

export const useOfflineScan = (
  trust: TrustData | null,
  isTrustLoading = false
) => {
  // useState's lazy initialiser builds the accumulator on the first render only, never again.
  const [accumulator] = useState(() => new PayloadFrameAccumulator())
  const [progress, setProgress] = useState<OfflineScanProgress | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const addFrame = useCallback(
    (rawText: string) => {
      if (result) {
        return
      }

      let snapshot

      try {
        snapshot = accumulator.add(rawText)
      } catch {
        // A misread frame is skipped: the display cycles, so the same frame comes round again.
        return
      }

      if (!snapshot.complete || !snapshot.presentation || isTrustLoading) {
        setProgress({ received: snapshot.received, total: snapshot.total })
        return
      }

      accumulator.reset()
      setProgress(null)
      setResult(
        trust
          ? verifyPresentation(snapshot.presentation, trust, {
              now: Math.floor(Date.now() / 1000),
            })
          : { ok: false, code: 'STALE_TRUST_DATA', warnings: [] }
      )
    },
    [accumulator, isTrustLoading, result, trust]
  )

  const reset = useCallback(() => {
    accumulator.reset()
    setProgress(null)
    setResult(null)
  }, [accumulator])

  return { addFrame, progress, reset, result }
}
