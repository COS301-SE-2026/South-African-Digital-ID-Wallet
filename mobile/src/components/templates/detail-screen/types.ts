import type { ReactNode, Ref } from 'react'
import type { ScrollView } from 'react-native'

export type DetailScreenProps = {
  action?: ReactNode
  children: ReactNode
  onBack: () => void
  scrollRef?: Ref<ScrollView>
  testID?: string
  title: string
}
