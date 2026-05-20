import { Zap, Shield, Share2, LockKeyhole } from 'lucide-react'
import Image from 'next/image'
import { Text } from '@/components/atoms'
import FlashIdWhite from '@/assets/images/FlashID-white.png'

export function RegistrationSidebar() {
  return (
    <div className="hidden lg:flex h-full w-2/5 flex-col justify-between rounded-tr-3xl rounded-br-3xl bg-linear-to-b from-secure-night to-deep-green p-10 text-clean-white">
      {/* Top: logo + headline + subtitle */}
      <div>
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl w-14 h-14 overflow-hidden shadow-lg">
            <Image src={FlashIdWhite} alt="Flash ID" width={56} height={56} />
          </div>
          <div>
            <Text variant="h1" className="text-clean-white">
              Flash ID
            </Text>
            <Text variant="sub-md" className="text-accent-gold">
              Secure Digital Identity Platform
            </Text>
          </div>
        </div>

        <Text variant="h2" className="mb-4 leading-tight text-clean-white">
          Secured. Verified.
          <br />
          <span className="text-accent-gold">Yours.</span>
        </Text>

        <Text variant="sub-lg" className="max-w-md text-clean-white/80">
          Create your Flash ID account and take control of your digital
          identity.
        </Text>
      </div>

      {/* Bottom: feature cards */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3 backdrop-blur-md">
          <Zap className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Text variant="h4" className="mb-0.5 text-clean-white">
              High-grade security
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70">
              Your registration details stay encrypted and safe.
            </Text>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3 backdrop-blur-md">
          <Shield className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Text variant="h4" className="mb-0.5 text-clean-white">
              Biometric access
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70">
              Sign in faster with secure identity verification.
            </Text>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3 backdrop-blur-md">
          <Share2 className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Text variant="h4" className="mb-0.5 text-clean-white">
              You&apos;re in control
            </Text>
            <Text variant="sub-sm" className="text-clean-white/70">
              Choose when and where your credentials are shared.
            </Text>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 pt-2">
          <LockKeyhole className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Text variant="sub-sm" className="text-clean-white/90">
              Trusted by citizens. Secured for you.
            </Text>
            <Text variant="sub-sm" className="mt-1 text-clean-white/70">
              Proudly South African
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
