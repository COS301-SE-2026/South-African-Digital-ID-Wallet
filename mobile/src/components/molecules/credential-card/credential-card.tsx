import { BadgeCheck, Bookmark } from 'lucide-react-native'
import { Pressable, View } from 'react-native'

import { CardGradient, Text } from '@/components/atoms'
import { colors } from '@/theme/colors'
import { CREDENTIAL_TONES } from '@/theme/credential-tones'

import type { CredentialCardProps } from './types'

export const CredentialCard = ({
  height,
  isVerified = false,
  issuedBy,
  onPress,
  testID,
  title,
  tone,
}: CredentialCardProps) => {
  const [from, to] = CREDENTIAL_TONES[tone]
  return (
    <Pressable
      accessibilityLabel={`${title}, issued by ${issuedBy}`}
      accessibilityRole="button"
      className="justify-start overflow-hidden rounded-3xl p-5 active:opacity-90"
      disabled={!onPress}
      onPress={onPress}
      style={{ height }}
      testID={testID}
    >
      <CardGradient from={from} radius={24} to={to} />
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="text-lg font-bold text-clean-white"
            numberOfLines={1}
          >
            {title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Text
              variant="caption"
              className="uppercase tracking-wider text-clean-white/70"
            >
              Issued by
            </Text>
            <Text
              variant="sub-sm"
              className="flex-1 font-semibold text-clean-white"
              numberOfLines={1}
            >
              {issuedBy}
            </Text>
          </View>
        </View>
        <View className="items-center gap-1.5">
          {isVerified ? <BadgeCheck size={26} color={colors.white} /> : null}
          <Bookmark
            size={20}
            color="rgba(255,255,255,0.55)"
            fill="rgba(255,255,255,0.3)"
          />
        </View>
      </View>
    </Pressable>
  )
}
