import { ScanFace, ShieldCheck, User } from 'lucide-react-native'
import { View } from 'react-native'

import { Text } from '@/components/atoms'
import { CredentialFieldRow } from '@/components/molecules'
import { colors } from '@/theme/colors'

import type { CredentialDetailCardProps } from './types'

export const CredentialDetailCard = ({
  fields,
  holderName,
  isVerified,
  issuedBy,
  testID = 'credential-detail-card',
  title,
}: CredentialDetailCardProps) => (
  <View
    className="overflow-hidden rounded-3xl border border-border-grey bg-cream-background p-5"
    testID={testID}
  >
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        <Text variant="caption">{issuedBy}</Text>
        <Text className="text-base font-bold text-text-primary">{title}</Text>
      </View>
      <View className="items-center">
        <ScanFace size={26} color={colors.primaryGreen} />
        <Text variant="caption" className="font-bold text-primary-green">
          FlashID
        </Text>
      </View>
    </View>

    <View className="mt-6 items-center gap-3">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-border-grey">
        <User size={44} color={colors.neutralMidGrey} />
        {isVerified ? (
          <View className="absolute bottom-0 right-0 rounded-full border-2 border-cream-background bg-primary-green p-1">
            <ShieldCheck size={12} color={colors.white} />
          </View>
        ) : null}
      </View>
      <Text variant="h3" className="text-text-primary">
        {holderName}
      </Text>
    </View>

    <View className="mt-6 gap-3.5">
      {fields.map((field) => (
        <CredentialFieldRow
          key={field.label}
          label={field.label}
          testID={`credential-field-${field.label}`}
          value={field.value}
        />
      ))}
    </View>

    <View className="mt-6 flex-row">
      <View
        className={
          isVerified
            ? 'flex-row items-center gap-1.5 rounded-full bg-success-green/10 px-3 py-1.5'
            : 'flex-row items-center gap-1.5 rounded-full bg-warning-amber/10 px-3 py-1.5'
        }
      >
        <ShieldCheck
          size={14}
          color={isVerified ? colors.success : colors.warning}
        />
        <Text
          variant="caption"
          className={
            isVerified
              ? 'font-semibold text-success-green'
              : 'font-semibold text-warning-amber'
          }
        >
          {isVerified ? 'Verified' : 'Not active'}
        </Text>
      </View>
    </View>
  </View>
)
