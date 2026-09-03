export type AuditLogFilterSheetProps = {
  action?: string
  actions: string[]
  isVisible: boolean
  onClose: () => void
  onSelect: (action?: string) => void
  testID?: string
}
