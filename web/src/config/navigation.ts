import {
  Bell,
  History,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react'

import type { SidebarNavSection } from '@/types/navigation'

{
  /*TODO: Untub hrefs */
}

export const citizenNavSections: SidebarNavSection[] = [
  {
    title: 'Citizen Portal',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'My Credentials', href: '/', icon: WalletCards },
      { label: 'Share QR Code', href: '/', icon: QrCode },
      { label: 'Notifications', href: '/', icon: Bell },
    ],
  },

  {
    title: 'Security',
    items: [
      { label: 'Verification History', href: '/', icon: History },
      { label: 'Privacy Settings', href: '/', icon: Settings },
    ],
  },
]

{
  /* TODO: add government and officials nav bar items */
}
export const governmentAdminNavSections: SidebarNavSection[] = [
  {
    title: 'Government Admin',
    items: [],
  },

  {
    title: 'Security',
    items: [],
  },
]

export const officialsNavSections: SidebarNavSection[] = [
  {
    title: 'Officials',
    items: [],
  },

  {
    title: 'Security',
    items: [],
  },
]
