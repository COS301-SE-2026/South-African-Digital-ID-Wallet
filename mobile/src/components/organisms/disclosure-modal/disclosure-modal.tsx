import { useState } from 'react'
import { X } from 'lucide-react-native'
import { Modal, Pressable, ScrollView, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { FieldToggleRow, IconButton } from '@/components/molecules'
import { MANDATORY_FIELDS, OPTIONAL_FIELDS } from '@/services/qr-service'
import { colors } from '@/theme/colors'

import type { DisclosureModalProps } from './types'

export const DisclosureModal = ({
  credentialType,
  isVisible,
  onClose,
  onConfirm,
  testID = 'disclosure-modal',
}: DisclosureModalProps) => {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    {}
  )

  const mandatoryFields = MANDATORY_FIELDS[credentialType]
  const optionalFields = OPTIONAL_FIELDS[credentialType]
  const selectedOptionalFields = optionalFields.filter(
    (field) => selectedFields[field]
  )

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="absolute inset-0 bg-black/60"
          onPress={onClose}
          testID="disclosure-backdrop"
        />
        <View
          className="max-h-[85%] rounded-t-3xl bg-clean-white pb-8 pt-5"
          testID={testID}
        >
          <View className="flex-row items-start justify-between px-5">
            <View className="flex-1 pr-3">
              <Text variant="h3">Choose what to share</Text>
              <Text variant="sub-sm" className="mt-1">
                Required details are always included. Turn on anything extra you
                are happy to reveal.
              </Text>
            </View>
            <IconButton
              accessibilityLabel="Close"
              color={colors.textPrimary}
              Icon={X}
              onPress={onClose}
              testID="disclosure-close"
            />
          </View>

          <ScrollView
            contentContainerClassName="gap-2.5 px-5 pb-4 pt-4"
            showsVerticalScrollIndicator={false}
          >
            <Text variant="label">Always shared</Text>
            {mandatoryFields.map((field) => (
              <FieldToggleRow
                key={field}
                isLocked
                isOn
                label={field}
                testID={`disclosure-mandatory-${field}`}
              />
            ))}

            <Text variant="label" className="mt-3">
              Optional
            </Text>
            {optionalFields.map((field) => (
              <FieldToggleRow
                key={field}
                isOn={Boolean(selectedFields[field])}
                label={field}
                onToggle={() =>
                  setSelectedFields((current) => ({
                    ...current,
                    [field]: !current[field],
                  }))
                }
                testID={`disclosure-optional-${field}`}
              />
            ))}
          </ScrollView>

          <View className="gap-2 border-t border-border-grey px-5 pt-4">
            <Text variant="caption" className="text-center">
              {mandatoryFields.length + selectedOptionalFields.length} fields
              will be shared
            </Text>
            <Button
              label="Confirm and generate QR"
              onPress={() => onConfirm(selectedOptionalFields)}
              testID="disclosure-confirm"
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}
