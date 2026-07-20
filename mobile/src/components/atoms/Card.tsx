import { View, ViewProps, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'

type CardProps = ViewProps & {
  padded?: boolean
}

export function Card({ style, padded = true, ...props }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...props} />
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  padded: {
    padding: spacing.lg,
  },
})
