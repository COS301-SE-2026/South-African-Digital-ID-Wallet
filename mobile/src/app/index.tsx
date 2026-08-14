import { View } from 'react-native'
import { Text } from '@/components/atoms/text'

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-cream-background">
      <Text variant="h1">Welcome back</Text>
      <Text variant="sub-md">Log in to your account</Text>

      <View className="mt-4 rounded-lg bg-deep-green px-6 py-3">
        <Text className="font-bold text-clean-white">Tailwind is working</Text>
      </View>
    </View>
  )
}
