'use client'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  Settings,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'

import Image from 'next/image'
import FlashIdWhite from '@/assets/images/FlashID-white.png'

import { useState } from 'react'

const citizenNav = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'My Credentials', icon: WalletCards },
  { label: 'Share QR Code', icon: QrCode },
  { label: 'Notifications', icon: Bell },
]

const securityNav = [
  { label: 'Login & Biometrics', icon: LockKeyhole },
  { label: 'Verification History', icon: History },
  { label: 'Privacy Settings', icon: Settings },
]

export function CitizenSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={
        'hidden min-h-screen flec-col bg-deep-green px-4 py-5 text-clean-white transition-all duration-300 lg:flex ${ isCollapsed? "w-24": "w-64"}'
      }
    >
      <div
        className={
          'mb-8 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}'
        }
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
            <Image
              src={FlashIdWhite}
              alt="Flash ID logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          {!isCollapsed && (
            <p className="text-xl font-bold whitespace-nowrap">Flash ID</p>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="rounded-xl p-2 text-clean-white/70 transition hover:bg-clean-white/10 hover:text-clean-white"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
