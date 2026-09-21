export type BreakGlassGateProps = {
  error?: string | null
  isSubmitting?: boolean
  onCancel: () => void
  onConfirm: (justification: string) => void
  testID?: string
}
