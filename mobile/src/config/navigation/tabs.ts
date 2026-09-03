import {
  History,
  Home,
  Inbox,
  ScanLine,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react-native'

import type { NavTabConfig } from '@/components/molecules'
import type { AppRole } from '@/lib/roles'

export const citizenTabs: NavTabConfig[] = [
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'wallet', label: 'Wallet', Icon: Wallet },
  { name: 'verify', label: 'Verify', Icon: ScanLine, variant: 'center' },
  { name: 'activity', label: 'Activity', Icon: ShieldCheck },
  { name: 'profile', label: 'Profile', Icon: User },
]

export const officialTabs: NavTabConfig[] = [
  { name: 'home', label: 'Home', Icon: Home },
  { name: 'requests', label: 'Requests', Icon: Inbox },
  { name: 'verify', label: 'Verify', Icon: ScanLine, variant: 'center' },
  { name: 'history', label: 'History', Icon: History },
  { name: 'profile', label: 'Profile', Icon: User },
]

export const TABS_BY_ROLE: Record<AppRole, NavTabConfig[]> = {
  citizen: citizenTabs,
  official: officialTabs,
}
