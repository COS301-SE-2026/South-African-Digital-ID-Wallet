export type SegmentedTabOption = {
  label: string
  name: string
}

export type SegmentedTabsVariant = 'pill' | 'underline'

export type SegmentedTabsProps = {
  activeName: string
  onChange: (name: string) => void
  options: SegmentedTabOption[]
  testID?: string
  variant?: SegmentedTabsVariant
}
