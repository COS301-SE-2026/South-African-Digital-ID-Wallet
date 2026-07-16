'use client'

import * as React from 'react'
import Image from 'next/image'
import { StatusPill } from '@/components/atoms/status-pill/status-pill'
import qrCodeImage from '@/assets/images/qrCodeImage.png'

const qr_duration = 120

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function WalletHeroCard() {
  const [secondsLeft, setSecondsLeft] = React.useState(qr_duration)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = () => setSecondsLeft(qr_duration)

  return (
    <div className="bg-deep-green rounded-3xl p-6 flex items-center justify-between gap-6">
      <div>
        <h1 className="text-2xl font-bold mt-3 text-white">
          This is your FlashID wallet dashboard.
        </h1>
        <p className="text-white/80 mt-2 max-w-md">
          Present a secure QR code when an authorised service provider needs to
          verify your identity.
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleGenerate}
            className="bg-white bg-deep-green px-4 py-2 rounded-2xl font-semibold hover:bg-white/90 transition-colors"
          >
            Generate QR Code
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center p-4">
          <Image
            src={qrCodeImage}
            alt="Flash ID QR code"
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <span className="text-xs font-semibold text-white/80">
          QR expires in {formatTime(secondsLeft)}
        </span>
      </div>
    </div>
  )
}
