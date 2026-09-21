import { Phone, TriangleAlert } from 'lucide-react-native'
import { View } from 'react-native'

import { Card, Divider, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { EmergencyProfileCardProps } from './types'

const formatUpdated = (value: string | null) =>
  value === null ? 'Date not recorded' : `Updated ${value.slice(0, 10)}`

export const EmergencyProfileCard = ({
  profile,
  testID = 'emergency-profile-card',
}: EmergencyProfileCardProps) => (
  <View className="gap-4 px-4 pb-6" testID={testID}>
    <Card className="gap-1">
      <Text variant="h3">
        {profile.identity.names} {profile.identity.surname}
      </Text>
      <Text variant="sub-sm" className="text-muted-text">
        Born {profile.identity.dateOfBirth.slice(0, 10)}
      </Text>
    </Card>

    <View className="flex-row items-start gap-2 rounded-2xl bg-warning-amber/15 p-3">
      <TriangleAlert size={18} color={colors.warning} />
      <Text variant="sub-sm" className="flex-1 text-text-primary">
        Self-reported by the citizen.{' '}
        {formatUpdated(profile.medicalLastUpdatedAt)}. Treat as a starting
        point, not a medical record.
      </Text>
    </View>

    <Card className="gap-3">
      <Text variant="sub-sm" className="font-bold text-text-primary">
        Medical
      </Text>
      {profile.medical.length === 0 ? (
        <Text variant="sub-sm" className="text-muted-text">
          The citizen released no medical fields.
        </Text>
      ) : (
        profile.medical.map((field, index) => (
          <View key={field.key} className="gap-1">
            {index > 0 ? <Divider /> : null}
            <Text variant="sub-sm" className="text-muted-text">
              {field.label}
            </Text>
            <Text className="text-text-primary">{field.value}</Text>
          </View>
        ))
      )}
    </Card>

    <Card className="gap-3">
      <Text variant="sub-sm" className="font-bold text-text-primary">
        Emergency contacts
      </Text>
      {profile.contacts.length === 0 ? (
        <Text variant="sub-sm" className="text-muted-text">
          No contacts listed.
        </Text>
      ) : (
        profile.contacts.map((contact) => (
          <View
            key={`${contact.name}-${contact.relationship}`}
            className="gap-1"
          >
            <Text className="text-text-primary">
              {contact.name} · {contact.relationship}
            </Text>
            {contact.phone ? (
              <View className="flex-row items-center gap-2">
                <Phone size={14} color={colors.textMuted} />
                <Text variant="sub-sm" className="text-muted-text">
                  {contact.phone}
                </Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </Card>

    <Text variant="sub-sm" className="text-center text-muted-text">
      Ambulance 10177 · All emergencies from a mobile 112
    </Text>
  </View>
)
