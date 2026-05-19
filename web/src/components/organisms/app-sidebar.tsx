'use client'
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  History,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  UserRoundPen,
} from 'lucide-react'

import { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import FlashIdWhite from '@/assets/images/FlashID-white.png'

import type {
  SidebarNavSection,
  SidebarUser,
  SidebarIconName,
} from '@/types/navigation'

const sidebarIcons: Record<SidebarIconName, React.ElementType> = {
  dashboard: LayoutDashboard,
  credentials: WalletCards,
  qr: QrCode,
  notifications: Bell,
  biometrics: LockKeyhole,
  history: History,
  settings: Settings,
  users: Users,
  shield: ShieldCheck,
  onboard: UserRoundPen,
}

type AppSidebarProps = {
  navSections: SidebarNavSection[]
  user: SidebarUser
}

export const AppSidebar = ({
  navSections,
  user,
}: Readonly<AppSidebarProps>) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`flex h-screen overflow-hidden flex-col bg-deep-green px-4 py-5 text-clean-white transition-all duration-300 ${
        isCollapsed ? 'w-24' : 'w-64'
      }`}
    >
      <div
        className={`mb-5 flex items-center ${
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
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-clean-white/40">
                {section.title}
              </p>
            )}

            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = sidebarIcons[item.icon]

                {
                  /*TODO: Update isActive when app routing implemented */
                }
                const isActive = 0
                //item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={`${section.title}-${item.href}-${item.label}`}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      isCollapsed ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-clean-white/15 text-clean-white'
                        : 'text-clean-white/75 hover:bg-clean-white/10 hover:text-clean-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="mt-auto rounded-3xl border border-clean-white/10 bg-clean-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-clean-white/40 bg-primary-green/30 text-sm font-extrabold text-clean-white">
              {user.initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-clean-white">
                {user.name}
              </p>
              <p className="text-xs font-semibold text-accent-gold/80">
                {user.idLabel}
              </p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="mt-auto flex justify-center">
          <div
            title={` ${user.name} `}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-clean-white/30 bg-clean-white/10 text-sm font-extrabold text-clean-white"
          >
            {user.initials}
          </div>
        </div>
      )}
    </aside>
  )
}
