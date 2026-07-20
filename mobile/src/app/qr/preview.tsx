import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Eye } from 'lucide-react-native'
import { Card } from '@/components/atoms/Card'
import { useQrDisclosureStore } from '@/stores/qrDisclosureStore'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'
import { typography } from '@/theme/typography'

export default function PreviewScreen() {
  const router = useRouter()
  const { credentialType, mandatoryFields, selectedOptionalFields } =
    useQrDisclosureStore()

  const allDisclosedFields = [...mandatoryFields, ...selectedOptionalFields]

  const credentialLabel =
    credentialType === 'identityDocument'
      ? 'Identity document'
      : "Driver's license"

  const handleConfirm = () => {
    router.push('/qr/display')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Confirm what you&apos;re sharing</Text>
        <Text style={styles.subtitle}>{credentialLabel}</Text>

        <View style={styles.noticeRow}>
          <Eye size={16} color={colors.textSecondary} />
          <Text style={styles.noticeText}>
            This is exactly what the verifier will see when they scan your QR
            code.
          </Text>
        </View>

        <Card style={styles.card}>
          {allDisclosedFields.map((field) => (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field}</Text>
            </View>
          ))}
        </Card>

        <Text style={styles.summary}>
          {allDisclosedFields.length} field
          {allDisclosedFields.length === 1 ? '' : 's'} will be shared
        </Text>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backLabel}>Go back</Text>
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmLabel}>Confirm and generate QR</Text>
        </Pressable>
      </View>
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
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  card: {
    gap: 0,
  },
  fieldRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  summary: {
    textAlign: 'center',
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.lg,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  backLabel: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.green,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  confirmLabel: {
    color: colors.cream,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
})
