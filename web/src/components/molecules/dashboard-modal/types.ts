export type DashboardModalProps = {
  readonly open: boolean
  readonly title: string
  readonly children: React.ReactNode
  readonly onClose: () => void
}
