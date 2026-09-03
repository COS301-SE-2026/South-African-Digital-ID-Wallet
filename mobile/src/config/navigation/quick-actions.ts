import type { Href } from 'expo-router'
import { FolderClosed, QrCode, Share2, ShieldCheck } from 'lucide-react-native'
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
