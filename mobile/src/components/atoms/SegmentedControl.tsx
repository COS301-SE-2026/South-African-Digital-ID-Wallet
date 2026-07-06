import { Pressable, View, Text, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'
import { spacing, radius } from '@/theme/spacing'
import { typography } from '@/theme/typography'

type SegmentedControlProps = {
  options: string[]
  selectedIndex: number
  onChange: (index: number) => void
}

export function SegmentedControl({
  options,
  selectedIndex,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = index === selectedIndex
        return (
          <Pressable
            key={option}
            onPress={() => onChange(index)}
            style={[styles.segment, isSelected && styles.segmentSelected]}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? colors.cream : colors.textSecondary },
              ]}
            >
              {option}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.border,
    padding: spacing.xs / 2,
    borderRadius: radius.full,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.green,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
})
