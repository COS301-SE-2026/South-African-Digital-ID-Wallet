'use client'

import { FC, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { FlashlightIcon, FlashlightOffIcon } from 'lucide-react'
import { Text } from '@/components/atoms'
import type { QrCameraScannerProps, CameraState } from './types'

export const QrCameraScanner: FC<QrCameraScannerProps> = ({
  onScan,
  paused = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CameraState>('requesting')
  const [hasTorch, setHasTorch] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return

    let cancelled = false

    const setup = async () => {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
      } catch (error) {
        if (cancelled) return
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setState('denied')
        } else {
          setState('unavailable')
        }
        return
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      if (!videoRef.current) return
      videoRef.current.srcObject = stream

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (!cancelled) onScan(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          calculateScanRegion: (video) => {
            const smallerDimension = Math.min(
              video.videoWidth,
              video.videoHeight
            )
            const scanRegionSize = Math.round(smallerDimension * 0.9)
            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
              downScaledWidth: 1080,
              downScaledHeight: 1080,
            }
          },
        }
      )
      scannerRef.current = scanner

      try {
        await scanner.start()
        if (cancelled) return
        setState('active')
      } catch (error: unknown) {
        if (cancelled) return
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setState('denied')
        } else {
          setState('unavailable')
        }
        return
      }

      scanner
        .hasFlash()
        .then((available) => {
          if (!cancelled) setHasTorch(available)
        })
        .catch(() => {
          // torch detection failing should not affect the scan flow
        })
    }

    setup()

    return () => {
      cancelled = true
      scannerRef.current?.stop()
      scannerRef.current?.destroy()
      scannerRef.current = null
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [onScan])

  useEffect(() => {
    if (!scannerRef.current || state !== 'active') return
    if (paused) {
      scannerRef.current.pause()
    } else {
      scannerRef.current.start().catch(() => {
        // camera lifestyle handled by mount above
      })
    }
  }, [paused, state])

  const toggleTorch = async () => {
    if (!scannerRef.current) return
    await scannerRef.current.toggleFlash()
    setTorchOn(scannerRef.current.isFlashOn())
  }

  if (state === 'denied') {
    return (
      <Text variant="sub-md">
        Camera access was denied. Please allow camera access in your browser
        settings to scan a QR code.
      </Text>
    )
  }

  if (state === 'unavailable') {
    return (
      <Text variant="sub-md">
        A camera could not be found on this device. Please use a device with a
        camera to be able to scan a QR code.
      </Text>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-md">
      <video ref={videoRef} className="w-full" muted playsInline />
      {state === 'requesting' && (
        <Text variant="sub-sm">Requesting camera access...</Text>
      )}
      {hasTorch && state === 'active' && (
        <button
          type="button"
          onClick={toggleTorch}
          className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
        >
          {torchOn ? (
            <FlashlightIcon className="h-5 w-5" />
          ) : (
            <FlashlightOffIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  )
}
