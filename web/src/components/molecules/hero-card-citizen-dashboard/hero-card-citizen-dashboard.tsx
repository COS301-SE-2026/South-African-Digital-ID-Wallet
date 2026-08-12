'use client'
import Image from 'next/image'
import qrCodeImage from '@/assets/images/qrCodeImage.svg'
import { QrCode } from 'lucide-react'
import { Text } from '@/components/atoms/text'

export function WalletHeroCard() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-accent-gold via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
      <div className="relative overflow-hidden rounded-[26px] bg-deep-green px-6 py-7 md:px-8 md:py-8">
        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-xl">
            <Text
              as="h1"
              variant="sub-lg"
              className="text-2xl font-extrabold tracking-tight text-clean-white md:text-3xl lg:text-4xl"
            >
              This is your FlashID
              <span className="text-accent-gold"> wallet dashboard.</span>
            </Text>

            <p className="mt-3 max-w-lg text-sm leading-6 text-clean-white/70 md:text-base">
              Present your secure QR code whenever an authorised service
              provider needs to verify your identity.
            </p>
          </div>

          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 scale-110 rounded-[28px] bg-accent-gold/10 blur-2xl" />
            <div className="relative rounded-[26px] bg-gradient-to-br from-clean-white via-clean-white to-[#f0eee5] p-3 shadow-2xl shadow-black/30">
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-deep-green" />

                <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-deep-green">
                  FlashID
                </span>
              </div>

              <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-clean-white p-3 md:h-40 md:w-40">
                <Image
                  src={qrCodeImage}
                  alt="FlashID QR code"
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
