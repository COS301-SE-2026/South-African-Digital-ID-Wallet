import { LockKeyhole, Zap, Shield, Share2 } from 'lucide-react'
import Image from 'next/image'
import { Title, Subtitle } from '@/components/atoms'
import FlashIdWhite from '@/assets/images/FlashID-white.png'

export function RegistrationSidebar() {
  return (
    <div className="hidden lg:flex w-2/5 min-h-screen flex-col justify-between rounded-tr-3xl rounded-br-3xl bg-linear-to-b from-secure-night to-deep-green p-10 text-clean-white">
      <div>
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl w-14 h-14 overflow-hidden shadow-lg">
            <Image src={FlashIdWhite} alt="Flash ID" width={56} height={56} />
          </div>

          <div>
            <Title titleSize="h1" className="text-clean-white">
              Flash ID
            </Title>
            <Subtitle subtitleSize="md" className="text-accent-gold">
              Secure Digital Identity Platform
            </Subtitle>
          </div>
        </div>

        <Title titleSize="h2" className="mb-4 leading-tight text-clean-white">
          Secured. Verified.
          <br />
          <span className="text-accent-gold">Yours.</span>
        </Title>

        <Subtitle subtitleSize="lg" className="max-w-md text-clean-white/80">
          Create your Flash ID account and take control of your digital
          identity.
        </Subtitle>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3 backdrop-blur-md">
          <Zap className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Title titleSize="h4" className="mb-0.5 text-clean-white">
              High-grade security
            </Title>
            <Subtitle subtitleSize="sm" className="text-clean-white/70">
              Your data is encrypted and protected.
            </Subtitle>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3 backdrop-blur-md">
          <Shield className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Title titleSize="h4" className="mb-0.5 text-clean-white">
              Biometric access
            </Title>
            <Subtitle subtitleSize="sm" className="text-clean-white/70">
              Your data is encrypted and protected.
            </Subtitle>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3 backdrop-blur-md">
          <Share2 className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div>
            <Title titleSize="h4" className="mb-0.5 text-clean-white">
              You&apos;re in control
            </Title>
            <Subtitle subtitleSize="sm" className="text-clean-white/70">
              Your data is encrypted and protected.
            </Subtitle>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <LockKeyhole className="mt-1 h-10 w-6 shrink-0 text-accent-gold" />
          <div className="text-sm text-clean-white/90">
            <Subtitle subtitleSize="sm" className="text-clean-white/90">
              Trusted by citizens. Secured for you.
            </Subtitle>
            <Subtitle subtitleSize="sm" className="mt-1 text-clean-white/70">
              Proudly South African
            </Subtitle>
          </div>
        </div>
      </div>
    </div>
  )
}
