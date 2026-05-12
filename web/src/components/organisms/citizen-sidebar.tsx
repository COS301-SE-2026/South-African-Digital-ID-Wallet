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
  { label: 'Verification History', icon: History },
  { label: 'Privacy Settings', icon: Settings },
]

export function CitizenSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`flex min-h-screen flex-col bg-deep-green px-4 py-5 text-clean-white transition-all duration-300 ${
        isCollapsed ? 'w-24' : 'w-64'
      }`}
    >
      <div
        className={`mb-8 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
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
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="rounded-xl p-2 text-clean-white/70 transition hover:bg-clean-white/10 hover:text-clean-white"
          aria-label="Collapse sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="space-y-6">
        <div>
          {!isCollapsed && (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-clean-white/40">
              Citizen Portal
            </p>
          )}

          <div className="space-y-2">
            {citizenNav.map((item, index) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  type="button"
                  title={isCollapsed ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isCollapsed ? 'justify-center px-0' : ''
                  } ${
                    index === 0
                      ? 'bg-clean-white/15 text-clean-white'
                      : 'text-clean-white/75 hover:bg-clean-white/10 hover:text-clean-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          {!isCollapsed && (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-clean-white/40">
              Security
            </p>
          )}

          <div className="space-y-2">
            {securityNav.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  type="button"
                  title={isCollapsed ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-clean-white/75 transition hover:bg-clean-white/10 hover:text-clean-white ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && item.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {!isCollapsed && (
        <div className="mt-auto rounded-3xl bg-clean-white/10 p-5">
          <p className="mb-2 text-xs font-bold text-clean-white/60">
            Wallet Protection
          </p>

          <p className="mb-4 text-sm font-bold leading-snug">
            Your identity wallet is secured with biometric access and signed
            credentials.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full bg-clean-white/10 px-3 py-2 text-xs font-bold">
            <ShieldCheck className="h-3 w-3" />
            Secure mode active
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="mt-auto flex justify-center">
          <div
            title="Secure mode active"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-clean-white/10"
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      )}
    </aside>
  )
}
