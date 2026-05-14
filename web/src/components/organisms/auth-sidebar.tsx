import * as React from 'react'
import Image from 'next/image'
import { LockKeyhole, Zap, Shield, Share2 } from 'lucide-react'
import FlashIdWhite from '@/assets/images/FlashID-white.png'
import { Title, Subtitle } from '@/components/atoms'

export const AuthSidebar = () => {
  return (
    <div className="hidden lg:flex w-2/5 bg-linear-to-b from-secure-night to-deep-green text-clean-white p-10 flex-col justify-between min-h-screen rounded-tr-3xl rounded-br-3xl">
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="rounded-2xl w-14 h-14 overflow-hidden shadow-lg">
            <Image src={FlashIdWhite} alt="Flash ID" width={56} height={56} />
          </div>

          <div>
            <Title titleSize="h1" className="text-clean-white">
              Flash ID
            </Title>
            <Subtitle subtitleSize="md" className="text-primary-green">
              Secure Digital Identity Platform
            </Subtitle>
          </div>
        </div>

        <Title titleSize="h2" className="text-clean-white leading-tight mb-4">
          Fast. Secured.
          <br />
          Verified.
        </Title>

        <Subtitle subtitleSize="lg" className="text-clean-white/80 max-w-md">
          Create your FlashID account and take control of your digital identity.
        </Subtitle>
      </div>

      <div className="space-y-3">
        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Zap className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <Title titleSize="h4" className="text-clean-white mb-0.5">
              Instant Verification
            </Title>
            <Subtitle subtitleSize="sm" className="text-clean-white/70">
              Verify your identity in seconds with government-backed
              credentials.
            </Subtitle>
          </div>
        </div>

        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Shield className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <Title titleSize="h4" className="text-clean-white mb-0.5">
              Government Verified
            </Title>
            <Subtitle subtitleSize="sm" className="text-clean-white/70">
              Trusted identity verification backed by official institutions.
            </Subtitle>
          </div>
        </div>

        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Share2 className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <Title titleSize="h4" className="text-clean-white mb-0.5">
              Secure Credential Sharing
            </Title>
            <Subtitle subtitleSize="sm" className="text-clean-white/70">
              Share your credentials safely with trusted banks and institutions.
            </Subtitle>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <LockKeyhole className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div className="text-sm text-clean-white/90">
            <Subtitle subtitleSize="sm" className="text-clean-white/90">
              Trusted by citizens. Secured for you.
            </Subtitle>
            <Subtitle subtitleSize="sm" className="text-clean-white/70 mt-1">
              Proudly South African
            </Subtitle>
          </div>
        </div>
      </div>
    </div>
  )
}
