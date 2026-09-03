export type FieldToggleRowProps = {
  isLocked?: boolean
  isOn: boolean
  label: string
  onToggle?: (value: boolean) => void
  testID?: string
}
