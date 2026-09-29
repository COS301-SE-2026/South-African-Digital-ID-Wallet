'use client'
import { FC, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { CameraOff, Loader2, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'
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

  useEffect(() => {
    if (!videoRef.current) {
      return
    }
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
      if (!videoRef.current) {
        return
      }
      videoRef.current.srcObject = stream

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (!cancelled) {
            onScan(result.data)
          }
        },
        {
          highlightScanRegion: false,
          highlightCodeOutline: false,

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
    if (!scannerRef.current || state !== 'active') {
      return
    }

    if (paused) {
      scannerRef.current.pause()
    } else {
      scannerRef.current.start().catch(() => {})
    }
  }, [paused, state])

  if (state === 'denied') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:min-h-0 sm:px-6 sm:py-12">
        <Card className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl sm:rounded-[32px] sm:p-10 sm:shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>

          <Text variant="h2" className="mt-1">
            Camera access denied
          </Text>

          <Text variant="sub-md" className="text-muted-foreground">
            Please allow camera access in your browser settings to scan a QR
            code.
          </Text>
        </Card>
      </div>
    )
  }

  if (state === 'unavailable') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:min-h-0 sm:px-6 sm:py-12">
        <Card className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl sm:rounded-[32px] sm:p-10 sm:shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <CameraOff className="h-7 w-7 text-gray-500" />
          </div>

          <Text variant="h2" className="mt-1">
            No camera found
          </Text>

          <Text variant="sub-md" className="text-muted-foreground">
            Please use a device with a camera to scan a QR code.
          </Text>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full">
      <Card className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-gray-200 bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <Text variant="h1">Scan QR Code</Text>

          <Text variant="sub-md" className="mt-1 text-muted-foreground">
            Position the QR code inside the frame
          </Text>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-[500px] p-5 sm:p-6">
            <div className="pointer-events-none absolute left-1 top-1 h-12 w-12 border-l-4 border-t-4 border-emerald-600" />
            <div className="pointer-events-none absolute right-1 top-1 h-12 w-12 border-r-4 border-t-4 border-amber-500" />
            <div className="pointer-events-none absolute bottom-1 left-1 h-12 w-12 border-b-4 border-l-4 border-red-500" />
            <div className="pointer-events-none absolute bottom-1 right-1 h-12 w-12 border-b-4 border-r-4 border-blue-600" />

            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-black shadow-lg">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                muted
                playsInline
              />

              {state === 'requesting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                    <Loader2 className="h-7 w-7 animate-spin text-white" />
                  </div>

                  <Text variant="sub-sm" className="text-white">
                    Requesting camera access...
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <Text variant="sub-sm" className="text-gray-500">
            Secure • Signed • Controlled by You
          </Text>
        </div>
      </Card>
    </div>
  )
}
