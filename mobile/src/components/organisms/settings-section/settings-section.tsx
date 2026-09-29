import { Fragment } from 'react'
import { View } from 'react-native'

import { Divider } from '@/components/atoms'
import { SectionHeader, SettingsRow } from '@/components/molecules'

import type { SettingsSectionProps } from './types'

export const SettingsSection = ({
  rows,
  testID,
  title,
}: SettingsSectionProps) => {
  if (rows.length === 0) {
    return null
  }
  return (
    <View className="gap-2" testID={testID}>
      <SectionHeader title={title} />
      <View className="overflow-hidden rounded-2xl border border-border-grey bg-clean-white">
        {rows.map((row, index) => (
          <Fragment key={row.name}>
            {index > 0 ? <Divider /> : null}
            <SettingsRow
              Icon={row.Icon}
              label={row.label}
              onPress={row.onPress}
              testID={`settings-row-${row.name}`}
            />
          </Fragment>
        ))}
      </View>
    </View>
  )
}
