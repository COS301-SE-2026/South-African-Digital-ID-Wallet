export type FieldToggleRowProps = {
  description?: string
  isLocked?: boolean
  isOn: boolean
  label: string
  onToggle?: (value: boolean) => void
  testID?: string
}
