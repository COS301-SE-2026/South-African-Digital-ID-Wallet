import type { ReactNode, Ref } from 'react'
import type { ScrollView } from 'react-native'

export type DetailScreenProps = {
  action?: ReactNode
  children: ReactNode
  onBack: () => void
  // Lets a page scroll its content, for example back to a QR code that just changed.
  scrollRef?: Ref<ScrollView>
  testID?: string
  title: string
}
