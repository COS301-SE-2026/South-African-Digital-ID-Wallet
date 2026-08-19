import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'

import { Text } from '@/components/atoms'

import type { AuthScreenProps } from './types'

export const AuthScreen = ({ children, subtitle, title }: AuthScreenProps) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    className="flex-1 bg-cream-background"
  >
    <ScrollView
      contentContainerClassName="grow justify-center gap-8 px-6 py-12"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text variant="h1">{title}</Text>
        <Text variant="sub-md">{subtitle}</Text>
      </View>
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
)
