'use client'

import { FC, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Text } from '@/components/atoms'
import type { QrCameraScannerProps, CameraState } from './types'

export const QrCameraScanner: FC<QrCameraScannerProps> = ({
  onScan,
  paused = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [state, setState] = useState<CameraState>('requesting')

  useEffect(() => {
    if (!videoRef.current) return

    let cancelled = false

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (!cancelled) onScan(result.data)
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        calculateScanRegion: (video) => {
          const smallerDimension = Math.min(video.videoWidth, video.videoHeight)
          const scanRegionSize = Math.round(smallerDimension * 0.9)
          return {
            x: Math.round((video.videoWidth - scanRegionSize) / 2),
            y: Math.round((video.videoHeight - scanRegionSize) / 2),
            width: scanRegionSize,
            height: scanRegionSize,
            downScaledWidth: 700,
            downScaledHeight: 700,
          }
        },
      }
    )
    scannerRef.current = scanner

    scanner
      .start()
      .then(() => {
        if (!cancelled) setState('active')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setState('denied')
        } else {
          setState('unavailable')
        }
      })

    return () => {
      cancelled = true
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
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

  //   useEffect(() => {
  //     const container = videoRef.current?.parentElement
  //     if(!container) return

  //     const observer = new ResizeObserver(() => {
  //         if(scannerRef.current) {
  //             scannerRef.current.stop()
  //             scannerRef.current.start().catch(() => {
  //                 // mount effect already handles startup failures
  //             })
  //         }
  //     })

  //     observer.observe(container)
  //     return () => observer.disconnect()
  //   }, [])

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
    </div>
  )
}
