import type { QuickAction } from '@/config'

export type QuickActionsGridProps = {
  actions: QuickAction[]
  onSelect: (action: QuickAction) => void
  title?: string
}
