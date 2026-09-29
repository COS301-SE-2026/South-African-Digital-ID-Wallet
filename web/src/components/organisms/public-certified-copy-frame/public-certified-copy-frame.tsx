'use client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button, Text } from '@/components/atoms'
import type { PublicCertifiedCopyFrameProps } from './types'

export function PublicCertifiedCopyFrame({
  children,
}: Readonly<PublicCertifiedCopyFrameProps>) {
  const router = useRouter()
  const handleBack = () => {
    router.push('/officials/verify-document')
  }
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f7f4ea] px-4 py-3 text-[#053b2c] sm:px-6 sm:py-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-[#e4eadc]/70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-[-5rem] h-80 w-80 rounded-full bg-[#e4eadc]/70"
      />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-6xl flex-col">
        <div className="flex justify-start">
          <Button
            type="button"
            variant="text"
            LeftIcon={ArrowLeft}
            onClick={handleBack}
            className="!h-auto !w-auto !rounded-xl !border !border-deep-green !px-3 !py-2 text-deep-green hover:bg-deep-green hover:text-clean-white"
          >
            Back
          </Button>
        </div>
        <section className="flex flex-1 items-center justify-center py-3 sm:py-5">
          {children}
        </section>
        <footer className="flex flex-wrap items-center justify-center gap-3 pb-0 sm:gap-5">
          <Text as="span" variant="caption">
            Powered by FlashID
          </Text>
          <Text
            as="span"
            variant="caption"
            aria-hidden="true"
            className="text-[#9ca3af]"
          >
            |
          </Text>
          <Text as="span" variant="caption">
            Prove yourself in a flash.
          </Text>
        </footer>
      </div>
    </main>
  )
}
