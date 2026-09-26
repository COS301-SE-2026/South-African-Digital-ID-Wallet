import { useEffect, useState } from 'react'

import { loadDeviceSigner, type DeviceSigner } from '@/lib/offline/device-key'
import { createKeyBindingJwt } from '@/lib/offline/key-binding'
import {
  encodeKeyBindingFrame,
  KEY_BINDING_FRAME_PREFIX,
} from '@/lib/offline/qr-frames'

// Wire-format section 8: re-signed every 5 seconds, well inside the verifier's 30-second window.
const KEY_BINDING_REFRESH_MS = 5000

export type KeyBindingSource = { sdJwt: string; tid: string }

export type KeyBindingFrameState = {
  frame: string | null
  // The device key could not be loaded, so this bound code can never verify and must not be shown.
  isUnavailable: boolean
}

const nowInSeconds = () => Math.floor(Date.now() / 1000)

export const useKeyBindingFrame = (
  source: KeyBindingSource | null
): KeyBindingFrameState => {
  const [frame, setFrame] = useState<string | null>(null)
  const [failedTid, setFailedTid] = useState<string | null>(null)

  useEffect(() => {
    if (!source) {
      return
    }

    let signer: DeviceSigner | null = null
    let isActive = true

    const signNow = () => {
      if (signer && isActive) {
        setFrame(
          encodeKeyBindingFrame(
            source.tid,
            createKeyBindingJwt(source.sdJwt, signer, nowInSeconds())
          )
        )
      }
    }

    // The key is read from SecureStore once per presentation; after that only the signing repeats.
    void loadDeviceSigner()
      .then((loaded) => {
        signer = loaded
        signNow()
      })
      .catch(() => {
        if (isActive) {
          setFailedTid(source.tid)
        }
      })
    const interval = setInterval(signNow, KEY_BINDING_REFRESH_MS)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [source])

  // State is keyed by tid rather than cleared inside the effect, so a frame or failure from an earlier
  // presentation is never reported for a new one.
  return {
    frame:
      source && frame?.startsWith(`${KEY_BINDING_FRAME_PREFIX}:${source.tid}:`)
        ? frame
        : null,
    isUnavailable: source !== null && failedTid === source.tid,
  }
}
