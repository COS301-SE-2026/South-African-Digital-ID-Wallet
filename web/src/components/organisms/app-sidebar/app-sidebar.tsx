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
  Landmark,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import FlashIdLogo from '@/assets/images/FlashID-green.png'
import GreenCircleLogo from '@/assets/images/green-circle-logo.ico'
import { Button } from '@/components/atoms'
import type { SidebarIconName } from '@/types/navigation'
import type { AppSidebarProps } from './types'

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
  institutions: Landmark,
}

export const AppSidebar = ({
  navSections,
  user,
  onLogout,
  variant = 'desktop',
  onNavigate,
}: Readonly<AppSidebarProps>) => {
  const [isPinned, setIsPinned] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const dashboardHref = navSections[0]?.items[0]?.href ?? '/'
  const isExpanded = isPinned || isHovered
  const css = isExpanded ? 'w-64' : 'w-24'

  const handleCollapse = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsPinned(false)
    setIsHovered(false)
  }

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isPinned) {
          setIsHovered(false)
        }
      }}
      className={`relative flex overflow-hidden flex-col bg-deep-green px-4 py-5 text-clean-white transition-all duration-300 ${
        variant === 'desktop'
          ? `hidden lg:flex h-screen ${css}`
          : 'h-full w-full'
      }`}
    >
      <div
        className={`relative z-10 mb-5 flex items-center ${
          isExpanded ? 'justify-between' : 'justify-center'
        }`}
      >
        <Link
          href={dashboardHref}
          onClick={() => onNavigate?.()}
          className={`flex items-center ${
            isExpanded
              ? 'h-10 w-full justify-center'
              : 'h-10 w-10 justify-center'
          }`}
          aria-label="Go to dashboard"
        >
          {isExpanded ? (
            <Image
              src={FlashIdLogo}
              alt="FlashID Logo"
              width={140}
              height={40}
              priority
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              title={user.name}
            >
              <Image
                src={GreenCircleLogo}
                alt="FlashID Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
          )}
        </Link>

        {variant === 'desktop' && isPinned && (
          <button
            type="button"
            onClick={handleCollapse}
            className="rounded-xl p-2 text-clean-white/70 transition hover:bg-accent-gold/10 hover:text-accent-gold"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {variant === 'desktop' && !isPinned && isHovered && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setIsPinned(true)
            }}
            className="absolute right-2 rounded-xl p-2 text-clean-white/70 transition hover:bg-accent-gold/10 hover:text-accent-gold"
            aria-label="Keep sidebar open"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="relative z-10 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            {isExpanded && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-clean-white/40">
                {section.title}
              </p>
            )}

            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = sidebarIcons[item.icon]
                const isActive = pathname === item.href
                const iconColor = isActive
                  ? 'text-clean-white'
                  : 'text-accent-gold'

                return (
                  <Link
                    key={`${section.title}-${item.href}-${item.label}`}
                    href={item.href}
                    title={!isExpanded ? item.label : undefined}
                    onClick={() => onNavigate?.()}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      !isExpanded ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'border border-accent-gold bg-clean-white/10 text-clean-white'
                        : 'border border-transparent text-clean-white/75 hover:bg-clean-white/10 hover:text-clean-white'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors ${iconColor}`}
                    />

                    {isExpanded && item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {isExpanded && (
        <div className="relative z-10 mt-auto rounded-[26px] bg-gradient-to-r from-black via-accent-gold via-national-red via-national-blue to-primary-green p-[2px]">
          <div className="rounded-[24px] bg-deep-green p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent-gold/70 bg-primary-green/40 text-sm font-extrabold text-clean-white">
                  {user.initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-clean-white">
                    {user.name}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onLogout()
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-clean-white/10 px-3 py-2 text-sm font-semibold text-clean-white/80 transition hover:border-national-red/30 hover:bg-national-red/10 hover:text-national-red"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="relative z-10 mt-auto flex flex-col items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent-gold/70 bg-primary-green/30 text-sm font-extrabold text-clean-white"
            title={user.name}
            aria-label={`${user.name} avatar`}
          >
            {user.initials}
          </div>

          <Button
            onClick={(event) => {
              event.stopPropagation()
              onLogout()
            }}
            LeftIcon={LogOut}
          />
        </div>
      )}
    </aside>
  )
}
