import type { ReactElement, ReactNode } from 'react'
import type { RefreshControlProps } from 'react-native'

export type CitizenDashboardScreenProps = {
  children: ReactNode
  header: ReactNode
  testID?: string
  refreshControl?: ReactElement<RefreshControlProps>
}
