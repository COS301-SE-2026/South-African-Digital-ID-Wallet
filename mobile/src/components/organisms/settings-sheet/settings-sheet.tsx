import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react-native'
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  Keyboard,
  Platform,
} from 'react-native'

import { Text } from '@/components/atoms'
import { IconButton } from '@/components/molecules'
import { colors } from '@/theme/colors'

import type { SettingsSheetProps } from './types'

const SLIDE_DISTANCE = 500
const SLIDE_DURATION = 240

export const SettingsSheet = ({
  children,
  footer,
  isVisible,
  onClose,
  subtitle,
  testID = 'settings-sheet',
  title,
}: SettingsSheetProps) => {
  const { height } = useWindowDimensions()
  const [translateY] = useState(() => new Animated.Value(SLIDE_DISTANCE))
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const slideIn = useCallback(() => {
    Animated.timing(translateY, {
      duration: SLIDE_DURATION,
      easing: Easing.out(Easing.cubic),
      toValue: 0,
      useNativeDriver: false,
    }).start()
  }, [translateY])

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSubscription = Keyboard.addListener(showEvent, (event) =>
      setKeyboardHeight(event.endCoordinates.height)
    )
    const hideSubscription = Keyboard.addListener(hideEvent, () =>
      setKeyboardHeight(0)
    )
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      onShow={slideIn}
      transparent
      visible={isVisible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="absolute inset-0 bg-black/60"
          onPress={onClose}
          testID={`${testID}-backdrop`}
        />
        <Animated.View
          style={{
            maxHeight: height * 0.85,
            paddingBottom: keyboardHeight,
            transform: [{ translateY }],
            width: '100%',
          }}
        >
          <View
            className="shrink rounded-t-3xl bg-clean-white pb-8 pt-5"
            testID={testID}
          >
            <View className="flex-row items-start justify-between px-5">
              <View className="flex-1 pr-3">
                <Text variant="h3">{title}</Text>
                {subtitle ? (
                  <Text variant="sub-sm" className="mt-1">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <IconButton
                accessibilityLabel="Close"
                color={colors.textPrimary}
                Icon={X}
                onPress={onClose}
                testID={`${testID}-close`}
              />
            </View>

            <ScrollView
              contentContainerClassName="gap-3 px-5 pb-2 pt-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>

            {footer ? (
              <View className="border-t border-border-grey px-5 pt-4">
                {footer}
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
