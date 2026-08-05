'use client'

import Image from 'next/image'
import qrCodeImage from '@/assets/images/qrCodeImage.svg'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/atoms'

export function WalletHeroCard() {
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
          <Button className="bg-white text-deep-green hover:bg-white/90">
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
      </div>
    </div>
  )
}
