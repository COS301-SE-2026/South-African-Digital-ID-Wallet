export type SegmentedTabOption = {
  label: string
  name: string
}

export type SegmentedTabsProps = {
  activeName: string
  onChange: (name: string) => void
  options: SegmentedTabOption[]
  testID?: string
}
