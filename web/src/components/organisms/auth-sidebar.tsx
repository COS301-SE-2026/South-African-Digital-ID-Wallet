import * as React from 'react'
import Image from 'next/image'
import { LockKeyhole, Zap, Shield, Share2 } from 'lucide-react'
import FlashIdWhite from '@/assets/images/FlashID-white.png'

export function AuthSidebar() {
  return (
    <div className="hidden lg:flex w-2/5 bg-linear-to-b from-secure-night to-deep-green text-clean-white p-10 flex-col justify-between min-h-screen rounded-tr-3xl rounded-br-3xl">
      <div>
        <div className="flex items-center gap-4 mb-8">
          <div className="rounded-2xl w-14 h-14 overflow-hidden shadow-lg">
            <Image src={FlashIdWhite} alt="Flash ID" width={56} height={56} />
          </div>

          <div>
            <h1 className="text-4xl font-bold">Flash ID</h1>
            <p className="text-primary-green mt-1">
              Secure Digital Identity Platform
            </p>
          </div>
        </div>

        <h2 className="text-5xl font-bold leading-tight mb-4">
          Fast. Secured.
          <br />
          Verified.
        </h2>

        <p className="text-2xl text-clean-white/80 leading-relaxed max-w-md">
          Create your FlashID account and take control of your digital identity.
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Zap className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-base mb-0.5">
              Instant Verification
            </h3>
            <p className="text-clean-white/70 text-xs leading-relaxed">
              Verify your identity in seconds with government-backed
              credentials.
            </p>
          </div>
        </div>

        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Shield className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-base mb-0.5">
              Government Verified
            </h3>
            <p className="text-clean-white/70 text-xs leading-relaxed">
              Trusted identity verification backed by official institutions.
            </p>
          </div>
        </div>

        <div className="bg-clean-white/10 backdrop-blur-md rounded-3xl p-3 border border-clean-white/10 flex items-start gap-3">
          <Share2 className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div>
            <h3 className="font-semibold text-base mb-0.5">
              Secure Credential Sharing
            </h3>
            <p className="text-clean-white/70 text-xs leading-relaxed">
              Share your credentials safely with trusted banks and institutions.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <LockKeyhole className="h-10 w-6 text-primary-green mt-1 shrink-0" />
          <div className="text-sm text-clean-white/90">
            <div>Trusted by citizens. Secured for you.</div>
            <div className="text-xs text-clean-white/70 mt-1">
              Proudly South African
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
