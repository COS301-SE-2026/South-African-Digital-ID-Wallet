import { View, Text, StyleSheet } from 'react-native'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'
import { typography } from '@/theme/typography'

type StatusVariant = 'success' | 'danger' | 'warning'

type StatusBadgeProps = {
  label: string
  variant: StatusVariant
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    color: colors.success,
    background: colors.successBackground,
  },
  danger: {
    icon: XCircle,
    color: colors.danger,
    background: colors.dangerBackground,
  },
  warning: {
    icon: AlertCircle,
    color: colors.warning,
    background: colors.warningBackground,
  },
}

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Icon size={18} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
})
