import type {
  ActivityEntry,
  ActivityGroup,
} from '@/services/citizen-dashboard-service'

export type ActivityTimelineProps = {
  groups: ActivityGroup[]
  isError: boolean
  isPending: boolean
  onSelect?: (entry: ActivityEntry) => void
  testID?: string
}
