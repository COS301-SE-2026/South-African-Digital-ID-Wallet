import { View } from 'react-native'

import { QuickActionTile, SectionHeader } from '@/components/molecules'

import type { QuickActionsGridProps } from './types'

export const QuickActionsGrid = ({
  actions,
  onSelect,
  title = 'Quick Actions',
}: QuickActionsGridProps) => (
  <View className="gap-3" testID="quick-actions-grid">
    <SectionHeader title={title} />
    <View className="flex-row flex-wrap justify-between gap-y-3">
      {actions.map((action) => (
        <QuickActionTile
          className="w-[48%]"
          Icon={action.Icon}
          key={action.name}
          label={action.label}
          onPress={() => onSelect(action)}
          testID={`quick-actions-${action.name}`}
          tone={action.tone}
        />
      ))}
    </View>
  </View>
)
