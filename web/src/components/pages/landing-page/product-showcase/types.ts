import type { StaticImageData } from 'next/image'
import type { LucideIcon } from 'lucide-react'

export type ShowcaseScreen = {
  label: string
  shortLabel: string
  description: string
  icon: LucideIcon
  image: StaticImageData
  details: string[]
}
