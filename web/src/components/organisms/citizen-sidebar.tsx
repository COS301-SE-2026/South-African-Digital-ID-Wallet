import {
  Bell,
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

export function AppSidebar() {
  return <div></div>
}
