import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { CredentialFieldRow } from '@/components/molecules'
import { formatIdDate, formatSaId } from '@/lib/format-date'
import { SettingsSheet } from '@/components/organisms'

import type { PersonalInfoSheetProps } from './types'

export const PersonalInfoSheet = ({
  account,
  isVisible,
  onClose,
  profile,
}: PersonalInfoSheetProps) => {
  const fields = [
    {
      label: 'Full name',
      value:
        account?.fullName ??
        [profile?.names, profile?.surname].filter(Boolean).join(' '),
    },
    { label: 'Email', value: account?.emailAddress ?? profile?.email ?? '' },
    { label: 'ID number', value: formatSaId(profile?.saId ?? '') },
    { label: 'Phone', value: account?.phoneNumber ?? '' },
    {
      label: 'Date of birth',
      value: account?.dateOfBirth ? formatIdDate(account.dateOfBirth) : '',
    },
    {
      label: 'Member since',
      value: account?.memberSince ? formatIdDate(account.memberSince) : '',
    },
  ].filter((field) => field.value !== '')

  return (
    <SettingsSheet
      isVisible={isVisible}
      onClose={onClose}
      subtitle="The details we hold for your account."
      testID="personal-info-sheet"
      title="Personal Information"
    >
      <View className="gap-4">
        {fields.map((field) => (
          <CredentialFieldRow
            key={field.label}
            label={field.label}
            testID={`personal-field-${field.label}`}
            value={field.value}
          />
        ))}
        <Text variant="caption">
          To change your email, use the FlashID web portal.
        </Text>
      </View>
    </SettingsSheet>
  )
}
