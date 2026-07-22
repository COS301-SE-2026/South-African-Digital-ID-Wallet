import { View, Text, StyleSheet } from 'react-native'
import { Toggle } from '@/components/atoms/Toggle'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { typography } from '@/theme/typography'

type FieldRowProps = {
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
  locked?: boolean
}

export function FieldRow({
  label,
  value,
  onValueChange,
  locked = false,
}: FieldRowProps) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.label,
          { color: locked ? colors.textMuted : colors.textPrimary },
        ]}
      >
        {label}
      </Text>
      <Toggle value={value} onValueChange={onValueChange} disabled={locked} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
  },
})
