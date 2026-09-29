export type StatusBadgeTone = 'danger' | 'neutral' | 'success' | 'warning'

export type StatusBadgeProps = {
  label: string
  testID?: string
  tone?: StatusBadgeTone
}
