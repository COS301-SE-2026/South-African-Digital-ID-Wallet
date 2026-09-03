import { useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native'

import { FlashIdLogo, Text } from '@/components/atoms'

import type { AuthScreenProps } from './types'

const SHOW_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const HIDE_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

const useIsKeyboardOpen = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, () => setIsOpen(true))
    const hide = Keyboard.addListener(HIDE_EVENT, () => setIsOpen(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return isOpen
}

export const AuthScreen = ({ children, subtitle, title }: AuthScreenProps) => {
  const isKeyboardOpen = useIsKeyboardOpen()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-cream-background"
    >
      <ScrollView
        contentContainerClassName="grow px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isKeyboardOpen ? null : (
          <View className="items-center pb-4 pt-28">
            <FlashIdLogo width={200} />
          </View>
        )}
        <View
          className={
            isKeyboardOpen
              ? 'grow justify-start gap-8'
              : 'grow justify-center gap-8 pb-8'
          }
        >
          <View className="gap-1">
            <Text variant="h1">{title}</Text>
            <Text variant="sub-md">{subtitle}</Text>
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
