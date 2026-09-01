import { useCallback, useMemo, useRef, useState } from 'react'
import { Animated, ScrollView, View } from 'react-native'
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'

import { CredentialCard } from '@/components/molecules'

import { CARD_HEIGHT, CARD_PEEK, FOCUS_GAP, SCROLL_STEP } from './constants'
import type { CredentialDeckProps } from './types'

const clamp = (value: number, max: number) =>
  Math.min(Math.max(value, 0), Math.max(max, 0))

export const CredentialDeck = ({
  credentials,
  onSelect,
  testID = 'credential-deck',
}: CredentialDeckProps) => {
  const scrollRef = useRef<ScrollView>(null)
  const [scrollY] = useState(() => new Animated.Value(0))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  const lastIndex = Math.max(credentials.length - 1, 0)

  const snapToOffsets = useMemo(
    () => credentials.map((_, index) => index * SCROLL_STEP),
    [credentials]
  )

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const next = clamp(
            Math.round(event.nativeEvent.contentOffset.y / SCROLL_STEP),
            lastIndex
          )
          setFocusedIndex((current) => (current === next ? current : next))
        },
        useNativeDriver: true,
      }),
    [lastIndex, scrollY]
  )

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) =>
      setViewportHeight(event.nativeEvent.layout.height),
    []
  )

  const handlePress = useCallback(
    (index: number) => {
      if (index === focusedIndex) {
        onSelect(credentials[index])
        return
      }
      scrollRef.current?.scrollTo({
        animated: true,
        y: index * SCROLL_STEP,
      })
    },
    [credentials, focusedIndex, onSelect]
  )

  const contentHeight = Math.max(
    viewportHeight + lastIndex * SCROLL_STEP,
    lastIndex * CARD_PEEK + FOCUS_GAP + CARD_HEIGHT + 24
  )

  return (
    <View className="flex-1" onLayout={handleLayout} testID={testID}>
      <Animated.ScrollView
        decelerationRate="fast"
        onScroll={onScroll}
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToOffsets={snapToOffsets}
      >
        <View style={{ height: contentHeight }}>
          {credentials.map((credential, index) => {
            const focusOffset = index * SCROLL_STEP

            const stick = scrollY.interpolate({
              extrapolateLeft: 'clamp',
              extrapolateRight: 'extend',
              inputRange: [focusOffset - 1, focusOffset, focusOffset + 1],
              outputRange: [0, 0, 1],
            })

            const push = scrollY.interpolate({
              extrapolate: 'clamp',
              inputRange: [focusOffset - SCROLL_STEP, focusOffset],
              outputRange: [FOCUS_GAP, 0],
            })

            const scale = scrollY.interpolate({
              extrapolate: 'clamp',
              inputRange: [focusOffset, focusOffset + SCROLL_STEP],
              outputRange: [1, 0.94],
            })

            return (
              <Animated.View
                key={credential.id}
                style={{
                  elevation: 4,
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  shadowColor: '#000',
                  shadowOffset: { height: 6, width: 0 },
                  shadowOpacity: 0.18,
                  shadowRadius: 12,
                  top: index * CARD_PEEK,
                  transform: [
                    { translateY: Animated.add(stick, push) },
                    { scale },
                  ],
                  zIndex: index,
                }}
              >
                <CredentialCard
                  height={CARD_HEIGHT}
                  isVerified={credential.isVerified}
                  issuedBy={credential.issuedBy}
                  onPress={() => handlePress(index)}
                  testID={`credential-card-${credential.id}`}
                  title={credential.title}
                  tone={credential.tone}
                />
              </Animated.View>
            )
          })}
        </View>
      </Animated.ScrollView>
    </View>
  )
}
