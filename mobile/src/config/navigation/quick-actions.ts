import type { Href } from 'expo-router'
import {
  FolderClosed,
  QrCode,
  Share2,
  ShieldCheck,
  History,
  ScrollText,
  ScanLine,
  UserCog,
} from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

export type QuickAction = {
  href: Href
  Icon: LucideIcon
  label: string
  name: string
  tone: IconTileTone
}

export const citizenQuickActions: QuickAction[] = [
  {
    href: '/citizen/verify',
    Icon: QrCode,
    label: 'Scan QR',
    name: 'scan-qr',
    tone: 'green',
  },
  {
    href: '/citizen/wallet',
    Icon: Share2,
    label: 'Share ID',
    name: 'share-id',
    tone: 'gold',
  },
  {
    href: '/citizen/wallet',
    Icon: FolderClosed,
    label: 'My Documents',
    name: 'my-documents',
    tone: 'green',
  },
  {
    href: '/citizen/activity',
    Icon: ShieldCheck,
    label: 'Verify Identity',
    name: 'verify-identity',
    tone: 'blue',
  },
]

export const officialQuickActions: QuickAction[] = [
  {
    href: '/official/verify',
    Icon: ScanLine,
    label: 'Scan ID',
    name: 'scan-id',
    tone: 'green',
  },
  {
    href: '/official/history',
    Icon: History,
    label: 'History',
    name: 'history',
    tone: 'blue',
  },
  {
    href: '/official/audit-log',
    Icon: ScrollText,
    label: 'Audit Log',
    name: 'audit-log',
    tone: 'gold',
  },
  {
    href: '/official/profile',
    Icon: UserCog,
    label: 'My Profile',
    name: 'profile',
    tone: 'green',
  },
]
