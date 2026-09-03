export type Requirement = {
  label: string
  met: boolean
}

export type RequirementListProps = {
  items: Requirement[]
  testID?: string
}
