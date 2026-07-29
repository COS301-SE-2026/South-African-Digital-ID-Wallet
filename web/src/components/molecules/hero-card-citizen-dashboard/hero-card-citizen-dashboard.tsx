'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import qrCodeImage from '@/assets/images/qrCodeImage.png'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms/text'

const qr_duration = 120

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function WalletHeroCard() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(qr_duration)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? qr_duration : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleGenerate = () => router.push('/citizen/qr')

  return (
    <div className="bg-deep-green rounded-3xl p-6 flex items-center justify-between gap-6">
      <div>
        <Text
          as="h1"
          variant="sub-lg"
          className="mt-3 text-white text-2xl md:text-3xl font-bold"
        >
          This is your FlashID wallet dashboard.
        </Text>

        <p className="text-white/80 mt-2 max-w-md">
          Present a secure QR code when an authorised service provider needs to
          verify your identity.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleGenerate}
            className="bg-white text-deep-green hover:bg-white/90"
          >
            Generate QR Code
          </Button>
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
