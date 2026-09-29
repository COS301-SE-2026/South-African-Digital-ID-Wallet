import { X } from 'lucide-react-native'
import { Modal, Pressable, View } from 'react-native'

import { Button, Text } from '@/components/atoms'
import { IconButton } from '@/components/molecules'
import { colors } from '@/theme/colors'

import type { ScannerHelpModalProps } from './types'

const STEPS = [
  'Ask the holder to open their wallet, tap a credential and share it.',
  'Hold your phone steady, about 20 cm from their screen.',
  'Line the QR code up inside the green frame, it scans on its own.',
  'In low light, tap the flash icon in the top right.',
]

export const ScannerHelpModal = ({
  isVisible,
  onClose,
  testID = 'scanner-help-modal',
}: ScannerHelpModalProps) => (
  <Modal
    animationType="fade"
    onRequestClose={onClose}
    transparent
    visible={isVisible}
  >
    <View className="flex-1 justify-end">
      <Pressable
        accessibilityLabel="Close help"
        accessibilityRole="button"
        className="absolute inset-0 bg-black/60"
        onPress={onClose}
        testID="scanner-help-backdrop"
      />
      <View
        className="gap-4 rounded-t-3xl bg-clean-white px-5 pb-8 pt-5"
        testID={testID}
      >
        <View className="flex-row items-center justify-between">
          <Text variant="h3">How to scan</Text>
          <IconButton
            accessibilityLabel="Close"
            color={colors.textPrimary}
            Icon={X}
            onPress={onClose}
            testID="scanner-help-close"
          />
        </View>

        {STEPS.map((step, index) => (
          <View key={step} className="flex-row items-start gap-3">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-green/10">
              <Text variant="caption" className="font-bold text-primary-green">
                {index + 1}
              </Text>
            </View>
            <Text variant="sub-sm" className="flex-1 text-text-primary">
              {step}
            </Text>
          </View>
        ))}

        <Text variant="caption">
          Only the fields the holder chose to share are revealed.
        </Text>

        <Button
          label="Got it"
          onPress={onClose}
          testID="scanner-help-dismiss"
        />
      </View>
    </View>
  </Modal>
)
