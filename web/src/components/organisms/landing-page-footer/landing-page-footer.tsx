'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'
import FlashIdLogo from '@/assets/images/FlashID-white.png'

export function LandingPageFooter() {
  return (
    <footer className="bg-deep-green">
      <div className="flex h-1 w-full">
        <div className="flex-1 bg-deep-green" />
        <div className="flex-1 bg-accent-gold" />
        <div className="flex-1 bg-text-primary" />
        <div className="flex-1 bg-national-red" />
        <div className="flex-1 bg-national-blue" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 lg:flex-row lg:px-10">
        <div className="flex items-center gap-4">
          <Image
            src={FlashIdLogo}
            alt="Flash ID"
            width={42}
            height={42}
            className="h-10 w-auto"
          />

          <div>
            <h2 className="text-lg font-bold text-clean-white">
              Flash<span className="text-accent-gold">ID</span>
            </h2>

            <p className="text-xs text-clean-white/70">
              Secure Digital Identity Platform
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-clean-white/70">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent-gold" />
            t3chtitansgo@gmail.com
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-gold" />
            Pretoria, South Africa
          </div>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <Link
            href="#"
            className="text-clean-white/70 transition hover:text-clean-white"
          >
            Privacy
          </Link>

          <Link
            href="#"
            className="text-clean-white/70 transition hover:text-clean-white"
          >
            Terms
          </Link>

          <Link
            href="#"
            className="text-clean-white/70 transition hover:text-clean-white"
          >
            Cookies
          </Link>
        </div>
      </div>

      <div className="border-t border-clean-white/10">
        <p className="py-3 text-center text-xs text-clean-white/50">
          © {new Date().getFullYear()} Flash ID. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
