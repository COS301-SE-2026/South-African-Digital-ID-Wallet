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

const nowInSeconds = () => Math.floor(Date.now() / 1000)

export const useKeyBindingFrame = (
  source: KeyBindingSource | null
): string | null => {
  const [frame, setFrame] = useState<string | null>(null)

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
        // No key means no K frame, and the verifier says the code cannot be linked to this phone.
      })
    const interval = setInterval(signNow, KEY_BINDING_REFRESH_MS)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [source])

  // A frame signed for an earlier presentation is never shown alongside a new one.
  return source &&
    frame?.startsWith(`${KEY_BINDING_FRAME_PREFIX}:${source.tid}:`)
    ? frame
    : null
}
