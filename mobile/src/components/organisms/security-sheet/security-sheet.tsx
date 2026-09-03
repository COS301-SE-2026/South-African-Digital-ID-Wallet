import { useState } from 'react'
import { View } from 'react-native'

import { FieldToggleRow, SegmentedTabs } from '@/components/molecules'
import { EmailChangeForm } from '@/components/organisms/email-change-form'
import { PasswordForm } from '@/components/organisms/password-form'
import { SettingsSheet } from '@/components/organisms/settings-sheet'
import { useBiometricPreference } from '@/hooks'

import type { SecuritySheetProps } from './types'

const TABS = [
  { label: 'Password', name: 'password' },
  { label: 'Email', name: 'email' },
]

export const SecuritySheet = ({ isVisible, onClose }: SecuritySheetProps) => {
  const [activeTab, setActiveTab] = useState('password')
  const { isEnabled, isSupported, toggle } = useBiometricPreference()

  return (
    <SettingsSheet
      isVisible={isVisible}
      onClose={onClose}
      subtitle="Update the details you use to sign in."
      testID="security-sheet"
      title="Security"
    >
      <View className="gap-5">
        {isSupported ? (
          <FieldToggleRow
            isOn={isEnabled}
            label="Unlock with Face ID or fingerprint"
            onToggle={(value) => void toggle(value)}
            testID="biometric-unlock-toggle"
          />
        ) : null}
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
