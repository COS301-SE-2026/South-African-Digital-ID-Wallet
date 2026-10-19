import { LayoutDashboard, Settings2, WalletCards, ScanFace } from 'lucide-react'
import dashboard from '@/assets/images/citizen-dashboard-pic.jpeg'
import account from '@/assets/images/manage-user-account-pic.jpeg'
import wallet from '@/assets/images/credential-wallet-pic.jpeg'
import verification from '@/assets/images/verify-identity-pic.jpeg'
import type { ShowcaseScreen } from './types'

export const SHOWCASE_SCREENS: ShowcaseScreen[] = [
  {
    label: 'Your day. Your identity. One dashboard.',
    shortLabel: 'Dashboard',
    description:
      'A clear starting point for your FlashID experience. Keep your identity overview and everyday actions close at hand.',
    icon: LayoutDashboard,
    image: dashboard,
    details: [
      'Your identity overview at a glance',
      'A clear place to find everyday wallet actions',
    ],
  },
  {
    label: 'An account that stays in your hands.',
    shortLabel: 'Your account',
    description:
      'Keep your details organised and review the devices you trust, all from your account settings.',
    icon: Settings2,
    image: account,
    details: ['Manage your account details', 'Review your trusted devices'],
  },
  {
    label: 'Important credentials. One clear home.',
    shortLabel: 'Credentials',
    description:
      'Browse your supported credentials in a wallet designed to keep important information organised and easy to find.',
    icon: WalletCards,
    image: wallet,
    details: [
      'View your supported credentials',
      'Keep identity documents organised',
    ],
  },
  {
    label: 'Your next step towards trusted identity.',
    shortLabel: 'Verification',
    description:
      'Find your identity-verification actions in a focused view, with the next step clearly in front of you.',
    icon: ScanFace,
    image: verification,
    details: [
      'Access identity-verification actions',
      'Follow the steps in one focused view',
    ],
  },
]
