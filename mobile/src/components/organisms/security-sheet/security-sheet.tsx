import { useState } from 'react'
import { View } from 'react-native'

import { SegmentedTabs } from '@/components/molecules'
import { EmailChangeForm } from '@/components/organisms/email-change-form'
import { PasswordForm } from '@/components/organisms/password-form'
import { SettingsSheet } from '@/components/organisms/settings-sheet'

import type { SecuritySheetProps } from './types'

const TABS = [
  { label: 'Password', name: 'password' },
  { label: 'Email', name: 'email' },
]

export const SecuritySheet = ({ isVisible, onClose }: SecuritySheetProps) => {
  const [activeTab, setActiveTab] = useState('password')

  return (
    <SettingsSheet
      isVisible={isVisible}
      onClose={onClose}
      subtitle="Update the details you use to sign in."
      testID="security-sheet"
      title="Security"
    >
      <View className="gap-5">
        <SegmentedTabs
          activeName={activeTab}
          onChange={setActiveTab}
          options={TABS}
          testID="security-tabs"
        />
        {activeTab === 'password' ? <PasswordForm /> : <EmailChangeForm />}
      </View>
    </SettingsSheet>
  )
}
