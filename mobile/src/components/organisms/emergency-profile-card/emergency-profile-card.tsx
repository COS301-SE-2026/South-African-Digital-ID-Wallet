import { HeartPulse, Phone, TriangleAlert } from 'lucide-react-native'
import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { CredentialFieldRow } from '@/components/molecules'
import { colors } from '@/theme/colors'

import type { EmergencyProfileCardProps } from './types'

const formatUpdated = (value: string | null) =>
  value === null ? 'Date not recorded' : `Updated ${value.slice(0, 10)}`

export const EmergencyProfileCard = ({
  profile,
  testID = 'emergency-profile-card',
}: EmergencyProfileCardProps) => {
  const name = `${profile.identity.names} ${profile.identity.surname}`.trim()

  return (
    <View className="gap-4" testID={testID}>
      <View className="gap-4 rounded-3xl border border-border-grey bg-cream-background p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-text-primary">
            Emergency profile
          </Text>
          <View className="flex-row items-center gap-1.5 rounded-full bg-danger-red/10 px-3 py-1.5">
            <HeartPulse size={14} color={colors.danger} />
            <Text variant="caption" className="font-semibold text-danger-red">
              Emergency access
            </Text>
          </View>
        </View>

        <View className="gap-3.5">
          {name ? (
            <CredentialFieldRow
              label="Full name"
              testID="emergency-field-name"
              value={name}
            />
          ) : null}
          {profile.identity.dateOfBirth ? (
            <CredentialFieldRow
              label="Date of birth"
              testID="emergency-field-dateOfBirth"
              value={profile.identity.dateOfBirth.slice(0, 10)}
            />
          ) : null}
          {profile.medical.length === 0 ? (
            <Text variant="caption">
              The citizen released no medical fields.
            </Text>
          ) : (
            profile.medical.map((field) => (
              <CredentialFieldRow
                key={field.key}
                label={field.label}
                testID={`emergency-field-${field.key}`}
                value={field.value}
              />
            ))
          )}
        </View>
      </View>

      <View className="gap-3.5 rounded-3xl border border-border-grey bg-cream-background p-5">
        <Text className="text-base font-bold text-text-primary">
          Emergency contacts
        </Text>
        {profile.contacts.length === 0 ? (
          <Text variant="caption">No contacts listed.</Text>
        ) : (
          profile.contacts.map((contact, index) => (
            <View key={`${index}-${contact.name}`} className="gap-0.5">
              <Text className="text-base font-semibold text-text-primary">
                {contact.name} · {contact.relationship}
              </Text>
              {contact.phone ? (
                <View className="flex-row items-center gap-2">
                  <Phone size={14} color={colors.textMuted} />
                  <Text variant="caption">{contact.phone}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View className="flex-row items-start gap-2 rounded-2xl bg-warning-amber/10 p-3">
        <TriangleAlert size={16} color={colors.warning} />
        <Text variant="caption" className="flex-1 text-text-primary">
          Self-reported by the citizen.{' '}
          {formatUpdated(profile.medicalLastUpdatedAt)}. Treat as a starting
          point, not a medical record.
        </Text>
      </View>

      <Text variant="caption" className="text-center">
        Ambulance 10177 · All emergencies from a mobile 112
      </Text>
    </View>
  )
}
