import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { ArrowLeft } from 'lucide-react-native'
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native'
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { DetailScreenProps } from './types'

const SHOW_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
const HIDE_EVENT =
  Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

const FIELD_MARGIN = 24

const useKeyboardHeight = () => {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, (event) =>
      setHeight(event.endCoordinates.height)
    )
    const hide = Keyboard.addListener(HIDE_EVENT, () => setHeight(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return height
}

export const DetailScreen = ({
  action,
  children,
  onBack,
  scrollRef,
  testID = 'detail-screen',
  title,
}: DetailScreenProps) => {
  const insets = useSafeAreaInsets()
  const keyboardHeight = useKeyboardHeight()
  const [screenHeight, setScreenHeight] = useState(0)
  const [fullScreenHeight, setFullScreenHeight] = useState(0)
  const innerScrollRef = useRef<ScrollView>(null)
  const viewportRef = useRef<View>(null)
  const scrollOffset = useRef(0)

  useImperativeHandle(scrollRef, () => innerScrollRef.current as ScrollView, [])

  const resizedBy = Math.max(0, fullScreenHeight - screenHeight)
  const keyboardPadding =
    keyboardHeight > 0 ? Math.max(0, keyboardHeight - resizedBy) : 0

  const handleScreenLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    setScreenHeight(height)
    setFullScreenHeight((previous) => Math.max(previous, height))
  }, [])

  const revealFocusedField = useCallback(() => {
    const input = TextInput.State.currentlyFocusedInput()
    const viewport = viewportRef.current
    if (!input || !viewport) {
      return
    }
    viewport.measureInWindow(
      (_viewportX, viewportTop, _viewportWidth, viewportHeight) => {
        input.measureInWindow((_inputX, inputTop, _inputWidth, inputHeight) => {
          const top = inputTop - viewportTop
          const bottom = top + inputHeight
          if (bottom + FIELD_MARGIN > viewportHeight) {
            innerScrollRef.current?.scrollTo({
              animated: true,
              y: scrollOffset.current + bottom + FIELD_MARGIN - viewportHeight,
            })
          } else if (top - FIELD_MARGIN < 0) {
            innerScrollRef.current?.scrollTo({
              animated: true,
              y: Math.max(0, scrollOffset.current + top - FIELD_MARGIN),
            })
          }
        })
      }
    )
  }, [])

  const handleViewportLayout = useCallback(() => {
    if (keyboardHeight > 0) {
      revealFocusedField()
    }
  }, [keyboardHeight, revealFocusedField])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y
    },
    []
  )

  return (
    <View
      className="flex-1 bg-clean-white"
      onLayout={handleScreenLayout}
      style={{ paddingBottom: keyboardPadding, paddingTop: insets.top }}
      testID={testID}
    >
      <View className="flex-row items-center px-3 py-2">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          onPress={onBack}
          testID="detail-back-button"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <Text
          className="flex-1 text-center text-base font-bold text-text-primary"
          numberOfLines={1}
        >
          {title}
        </Text>
        <View className="h-10 w-10" />
      </View>

      <View
        className="flex-1"
        onLayout={handleViewportLayout}
        ref={viewportRef}
      >
        <ScrollView
          ref={innerScrollRef}
          contentContainerClassName="gap-5 px-5 pb-8"
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>

      {action ? (
        <View className="border-t border-border-grey px-5 pb-4 pt-4">
          {action}
        </View>
      ) : null}
    </View>
  )
}
