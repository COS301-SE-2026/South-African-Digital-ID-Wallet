import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Card } from '@/components/atoms/Card'
import { SegmentedControl } from '@/components/atoms/SegmentedControl'
import { FieldRow } from '@/components/molecules/FieldRow'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'
import { typography } from '@/theme/typography'

type CredentialType = 'identityDocument' | 'driversLicense'

const MANDATORY_FIELDS = ['Full name', 'SA ID number', 'Date of birth', 'Photo']

const OPTIONAL_FIELDS: Record<CredentialType, string[]> = {
  identityDocument: [
    'Gender',
    'Citizenship',
    'Country of birth',
    'Nationality',
  ],
  driversLicense: [
    'License number',
    'License code',
    'Restrictions',
    'Expiry date',
  ],
}

export default function SelectFieldsScreen() {
  const router = useRouter()
  const [credentialType, setCredentialType] =
    useState<CredentialType>('identityDocument')
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    {
      Gender: true,
      Citizenship: true,
      'Country of birth': false,
      Nationality: false,
      'License number': true,
      'License code': true,
      Restrictions: false,
      'Expiry date': false,
    }
  )

  const optionalFields = OPTIONAL_FIELDS[credentialType]
  const selectedCount = optionalFields.filter(
    (field) => selectedFields[field]
  ).length

  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleContinue = () => {
    router.push('/qr/preview')
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose what to share</Text>

        <SegmentedControl
          options={['Identity document', "Driver's license"]}
          selectedIndex={credentialType === 'identityDocument' ? 0 : 1}
          onChange={(index) =>
            setCredentialType(
              index === 0 ? 'identityDocument' : 'driversLicense'
            )
          }
        />

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Always shared</Text>
          {MANDATORY_FIELDS.map((field) => (
            <FieldRow
              key={field}
              label={field}
              value={true}
              onValueChange={() => {}}
              locked
            />
          ))}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Optional fields</Text>
          {optionalFields.map((field) => (
            <FieldRow
              key={field}
              label={field}
              value={selectedFields[field]}
              onValueChange={() => toggleField(field)}
            />
          ))}
        </Card>

        <Text style={styles.summary}>
          {MANDATORY_FIELDS.length} shared, {selectedCount} optional selected
        </Text>
      </ScrollView>

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueLabel}>Review and continue</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  card: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  summary: {
    textAlign: 'center',
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  continueButton: {
    backgroundColor: colors.green,
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  continueLabel: {
    color: colors.cream,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
