import { FC } from 'react'
import { QuickActionsCard } from '../../molecules/quick-action-card'
import type { QuickActionsRowProps } from './types'

export const QuickActionsRow: FC<QuickActionsRowProps> = ({ actions }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <QuickActionsCard
          key={action.key}
          icon={action.icon}
          title={action.title}
          description={action.description}
          href={action.href}
          dataCy={`quick-action-${action.key}`}
        />
      ))}
    </div>
  )
}
