import type { ReactNode } from 'react'

export type SecurityOverviewPageProps = {
  // The Settings tab is a separate screen; whoever builds it passes it in here
  settingsContent?: ReactNode
}
