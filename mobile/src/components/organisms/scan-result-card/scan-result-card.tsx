import { ShieldCheck } from 'lucide-react-native'
import { Image, View } from 'react-native'

import { Text } from '@/components/atoms'
import { CredentialFieldRow } from '@/components/molecules'
import { colors } from '@/theme/colors'

import type { ScanResultCardProps } from './types'

const IMAGE_FIELD_LABELS = ['Photo', 'Photograph', 'Signature']

export const ScanResultCard = ({
  credentialType,
  disclosedFields,
  testID = 'scan-result-card',
}: ScanResultCardProps) => (
  <View
    className="gap-4 rounded-3xl border border-border-grey bg-cream-background p-5"
    testID={testID}
  >
    <View className="flex-row items-center justify-between">
      <Text className="text-base font-bold text-text-primary">
        {credentialType}
      </Text>
      <View className="flex-row items-center gap-1.5 rounded-full bg-success-green/10 px-3 py-1.5">
        <ShieldCheck size={14} color={colors.success} />
        <Text variant="caption" className="font-semibold text-success-green">
          Verified
        </Text>
      </View>
    </View>

    <View className="gap-3.5">
      {Object.entries(disclosedFields).map(([label, value]) =>
        IMAGE_FIELD_LABELS.includes(label) && value ? (
          <View key={label} className="gap-0.5">
            <Text variant="caption">{label}</Text>
            <Image
              className="h-24 w-24 rounded-2xl"
              source={{ uri: value }}
              testID={`scan-field-${label}`}
            />
          </View>
        ) : (
          <CredentialFieldRow
            key={label}
            label={label}
            testID={`scan-field-${label}`}
            value={value}
          />
        )
      )}
    </View>
  </View>
)
