import { Lock } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { CredentialCardProps, CredentialPatternIcon } from './types'

export const CREDENTIAL_PATTERN: CredentialPatternIcon[] = [
  { opacity: 0.35, right: 64, size: 26, top: -12 },
  { opacity: 0.25, right: 8, size: 24, top: -6 },
  { opacity: 0.45, right: 100, size: 28, top: 22 },
  { opacity: 0.9, right: 52, size: 30, strong: true, top: 38 },
  { opacity: 0.35, right: 6, size: 26, top: 32 },
  { opacity: 0.3, right: 118, size: 26, top: 70 },
  { opacity: 0.85, right: 66, size: 30, strong: true, top: 84 },
  { opacity: 0.4, right: 12, size: 26, top: 90 },
  { opacity: 0.35, right: 104, size: 26, top: 116 },
  { opacity: 0.3, right: 44, size: 24, top: 130 },
]

export const CredentialCard = ({
  height,
  hint,
  Icon,
  issuedBy,
  onPress,
  testID,
  title,
}: CredentialCardProps) => (
  <Pressable
    accessibilityHint={hint}
    accessibilityLabel={`${title}, issued by ${issuedBy}`}
    accessibilityRole="button"
    className="overflow-hidden rounded-3xl border border-border-grey bg-clean-white p-5 active:opacity-90"
    disabled={!onPress}
    onPress={onPress}
    style={{
      elevation: 2,
      height,
      shadowColor: colors.black,
      shadowOffset: { height: 2, width: 0 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    }}
    testID={testID}
  >
    <View
      accessibilityElementsHidden
      className="absolute bottom-0 right-0 top-0 w-40"
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      testID={testID ? `${testID}-pattern` : undefined}
    >
      {CREDENTIAL_PATTERN.map((item, index) => (
        <View
          key={index}
          style={{
            opacity: item.opacity,
            position: 'absolute',
            right: item.right,
            top: item.top,
            transform: [{ rotate: '-28deg' }],
          }}
        >
          <Icon
            color={item.strong ? colors.green : colors.primaryGreen}
            size={item.size}
          />
        </View>
      ))}
    </View>

    <View className="flex-row items-start gap-4 pr-24">
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-green/10">
        <Icon color={colors.green} size={30} />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold text-deep-green" numberOfLines={1}>
          {title}
        </Text>
        <Text
          variant="caption"
          className="mt-2 uppercase tracking-wider text-muted-text"
        >
          Issued by
        </Text>
        <Text className="text-base text-text-primary" numberOfLines={1}>
          {issuedBy}
        </Text>
      </View>
    </View>

    {hint ? (
      <View
        className="mt-auto flex-row items-center gap-2"
        testID={testID ? `${testID}-hint` : undefined}
      >
        <Lock color={colors.green} size={18} />
        <Text variant="sub-sm" className="text-muted-text">
          {hint}
        </Text>
      </View>
    ) : null}
  </Pressable>
)
