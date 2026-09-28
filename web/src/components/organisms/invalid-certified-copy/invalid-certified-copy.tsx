import { AlertCircle, X } from 'lucide-react'
import { Text } from '@/components/atoms'
import { PublicCertifiedCopyFrame } from '@/components/organisms/public-certified-copy-frame'
import type { InvalidCertifiedCopyProps } from './types'

export function InvalidCertifiedCopy(
  _props: Readonly<InvalidCertifiedCopyProps>,
) {
  return (
    <PublicCertifiedCopyFrame>
      <div
        aria-live="polite"
        className="w-full max-w-2xl rounded-[24px] border border-[#4c7467] bg-white/90 px-5 py-8 shadow-[0_18px_50px_rgba(5,59,44,0.08)] backdrop-blur-sm sm:px-12 sm:py-12"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#fdebed] sm:h-32 sm:w-32">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ef2d32] text-white sm:h-24 sm:w-24">
              <X className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={3} />
            </div>
          </div>
          <Text
            as="h1"
            variant="h1"
            className="mt-8 text-3xl text-[#053b2c] sm:text-4xl"
          >
            Certified Copy Invalid
          </Text>
          <Text
            as="p"
            variant="sub-md"
            className="mt-4 max-w-lg text-[#34434b]"
          >
            This certified copy could not be verified or is no longer valid.
          </Text>
        </div>
        <div className="my-8 h-px bg-[#e5e7eb]" />
        <div className="flex items-start gap-4 rounded-2xl bg-[#fde8e8] px-5 py-6 text-left sm:px-7">
          <AlertCircle
            className="mt-0.5 h-8 w-8 shrink-0 text-[#d72f32]"
            strokeWidth={2.5}
          />
          <div>
            <Text
              as="p"
              variant="sub-md"
              className="font-bold text-[#b8242a] sm:text-xl"
            >
              This certified copy is not valid.
            </Text>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-2 text-[#a8474b] sm:text-base"
            >
              Please do not rely on this copy as a trusted version of the
              credential.
            </Text>
          </div>
        </div>
      </div>
    </PublicCertifiedCopyFrame>
  )
}