import type { LucideIcon } from 'lucide-react'

export type TrustedDevice = {
  id: string
  name: string
  meta: string
  status: 'Active' | 'Known'
  icon: LucideIcon
}
