import Image from 'next/image'
import { LockKeyhole, Zap, Shield, Share2 } from 'lucide-react'

import FlashIdLogo from '@/assets/images/FlashID-green.png'
import { Text } from '@/components/atoms'

export const AuthSidebar = () => {
  return (
    <div className="hidden lg:flex w-2/5 bg-deep-green text-clean-white p-10 flex-col justify-between min-h-screen rounded-tr-3xl rounded-br-3xl">
      <div>
        <div className="mb-8">
          <Image
            src={FlashIdLogo}
            alt="Flash ID"
            width={280}
            height={90}
            className="h-20 w-auto object-contain"
            priority
          />
          <div>
            <Text
              variant="sub-sm"
              className="text-clean-white/60 tracking-[0.15em] uppercase font-semibold"
            >
              Prove yourself in a{' '}
              <span className="text-accent-gold">Flash</span>
            </Text>
          </div>
        </div>
        <Text variant="h2" className="text-clean-white leading-tight mb-4">
          Fast. Secured.
          <br />
          Verified.
        </Text>

        <Text variant="sub-lg" className="text-clean-white/80 max-w-md">
          Create your FlashID account and take control of your digital identity.
        </Text>
      </div>

      <div className="space-y-3">
        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Zap className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <Text variant="h4" className="text-clean-white mb-0.5">
              Instant Verification
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70">
              Verify your identity in seconds with government-backed
              credentials.
            </Text>
          </div>
        </div>

        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Shield className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <Text variant="h4" className="text-clean-white mb-0.5">
              Government Verified
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70">
              Trusted identity verification backed by official institutions.
            </Text>
          </div>
        </div>

        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Share2 className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <Text variant="h4" className="text-clean-white mb-0.5">
              Secure Credential Sharing
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70">
              Share your credentials safely with trusted banks and institutions.
            </Text>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <LockKeyhole className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div className="text-sm text-clean-white/90">
            <Text variant="sub-sm" className="text-clean-white/90">
              Trusted by citizens. Secured for you.
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70 mt-1">
              Proudly South African
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
