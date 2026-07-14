import type { LucideIcon } from 'lucide-react'

export interface TrustedDevice {
  id: string
  name: string
  meta: string
  status: 'Active' | 'Known'
  icon: LucideIcon
}
