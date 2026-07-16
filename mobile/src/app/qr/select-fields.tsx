import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Check } from 'lucide-react-native'
import { Card } from '@/components/atoms/Card'
import { SegmentedControl } from '@/components/atoms/SegmentedControl'
import { FieldRow } from '@/components/molecules/FieldRow'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'
import { typography } from '@/theme/typography'
import { useQrDisclosureStore } from '@/stores/qrDisclosureStore'

type CredentialType = 'identityDocument' | 'driversLicense'

const MANDATORY_FIELDS: Record<CredentialType, string[]> = {
  identityDocument: [
    'Identity number',
    'Full surname',
    'Full forenames',
    'Date of birth',
    'Citizenship status',
    'Photograph',
  ],
  driversLicense: [
    'Full name',
    'SA ID number',
    'Photo',
    'License number',
    'License code',
    'Expiry date',
    'Country of issue',
  ],
}

const OPTIONAL_FIELDS: Record<CredentialType, string[]> = {
  identityDocument: [
    'Gender',
    'Country of birth',
    'Signature',
    'Card issue date and number',
  ],
  driversLicense: [
    'Signature',
    'Date of birth',
    'Vehicle restrictions',
    'Date of issue',
  ],
}

const ALL_OPTIONAL_FIELDS = Array.from(
  new Set([
    ...OPTIONAL_FIELDS.identityDocument,
    ...OPTIONAL_FIELDS.driversLicense,
  ])
)

export default function SelectFieldsScreen() {
  const router = useRouter()
  const [credentialType, setCredentialType] =
    useState<CredentialType>('identityDocument')
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_OPTIONAL_FIELDS.map((field) => [field, false]))
  )
  const [isHovered, setIsHovered] = useState(false)

  const optionalFields = OPTIONAL_FIELDS[credentialType]
  const mandatoryFields = MANDATORY_FIELDS[credentialType]
  const selectedCount = optionalFields.filter(
    (field) => selectedFields[field]
  ).length
  const allSelected = optionalFields.every((field) => selectedFields[field])

  const toggleField = (field: string) => {
    setSelectedFields((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSelectAll = () => {
    setSelectedFields((prev) => {
      const next = { ...prev }
      optionalFields.forEach((field) => {
        next[field] = true
      })
      return next
    })
  }

  const setSelection = useQrDisclosureStore((state) => state.setSelection)
  const credentialId = useQrDisclosureStore((state) => state.credentialId)
  const handleContinue = () => {
    setSelection({
      credentialId,
      credentialType,
      mandatoryFields,
      selectedOptionalFields: optionalFields.filter(
        (field) => selectedFields[field]
      ),
    })
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

        <View style={styles.officialBanner}>
          <Text style={styles.officialBannerTitle}>
            Is an official requesting your details?
          </Text>
          <Text style={styles.officialBannerBody}>
            Officials such as police officers are legally entitled to see every
            field. Select all before showing your QR code.
          </Text>
          <Pressable
            onPress={handleSelectAll}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={({ pressed }) => [
              styles.officialBannerButton,
              isHovered && styles.officialBannerButtonHovered,
              pressed && styles.officialBannerButtonPressed,
            ]}
          >
            {allSelected && <Check size={18} color={colors.textPrimary} />}
            <Text style={styles.officialBannerButtonLabel}>
              {allSelected ? 'All fields selected' : 'Select all for official'}
            </Text>
          </Pressable>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Always shared</Text>
          {mandatoryFields.map((field) => (
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
          {mandatoryFields.length} shared, {selectedCount} of{' '}
          {optionalFields.length} optional selected
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
  officialBanner: {
    backgroundColor: colors.warningBackground,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: spacing.md,
  },
  officialBannerTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  officialBannerBody: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  officialBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  officialBannerButtonHovered: {
    backgroundColor: '#E6A518',
  },
  officialBannerButtonPressed: {
    backgroundColor: '#CC9315',
    transform: [{ scale: 0.98 }],
  },
  officialBannerButtonLabel: {
    fontSize: typography.label.fontSize,
    fontWeight: '700',
    color: colors.textPrimary,
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
