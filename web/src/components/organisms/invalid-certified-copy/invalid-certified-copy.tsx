import { AlertCircle, X } from 'lucide-react'
import { Text } from '@/components/atoms'
import { PublicCertifiedCopyFrame } from '@/components/organisms/public-certified-copy-frame'
import type { InvalidCertifiedCopyProps } from './types'

export function InvalidCertifiedCopy(
  _props: Readonly<InvalidCertifiedCopyProps>
) {
  return (
    <PublicCertifiedCopyFrame>
      <div
        aria-live="polite"
        className="w-full max-w-2xl rounded-[24px] border border-[#4c7467] bg-white/90 px-4 py-5 shadow-[0_18px_50px_rgba(5,59,44,0.08)] backdrop-blur-sm sm:px-8 sm:py-7"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fdebed] sm:h-24 sm:w-24">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ef2d32] text-white sm:h-16 sm:w-16">
              <X className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={3} />
            </div>
          </div>
          <Text
            as="h1"
            variant="h1"
            className="mt-4 text-2xl text-[#053b2c] sm:text-3xl"
          >
            Certified Copy Invalid
          </Text>
          <Text
            as="p"
            variant="sub-md"
            className="mt-2 max-w-lg text-[#34434b]"
          >
            This certified copy could not be verified or is no longer valid.
          </Text>
        </div>
        <div className="my-5 h-px bg-[#e5e7eb]" />
        <div className="flex items-start gap-3 rounded-2xl bg-[#fde8e8] px-4 py-4 text-left sm:px-5 sm:py-5">
          <AlertCircle
            className="mt-0.5 h-6 w-6 shrink-0 text-[#d72f32]"
            strokeWidth={2.5}
          />
          <div>
            <Text as="p" variant="sub-md" className="font-bold text-[#b8242a]">
              This certified copy is not valid.
            </Text>
            <Text
              as="p"
              variant="sub-sm"
              className="mt-2 text-[#a8474b] sm:text-sm"
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
