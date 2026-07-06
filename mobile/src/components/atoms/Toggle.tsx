import { Pressable, StyleSheet, Animated } from 'react-native'
import { useEffect, useState } from 'react'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/spacing'

type ToggleProps = {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

const TRACK_WIDTH = 48
const TRACK_HEIGHT = 28
const THUMB_SIZE = 22
const THUMB_MARGIN = 3

export function Toggle({
  value,
  onValueChange,
  disabled = false,
}: ToggleProps) {
  const [translateX] = useState(() => new Animated.Value(value ? 1 : 0))

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start()
  }, [value, translateX])

  const handlePress = () => {
    if (disabled) return
    onValueChange(!value)
  }

  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2],
  })

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.green : colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX: thumbTranslate }] }]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
    justifyContent: 'center',
    padding: THUMB_MARGIN,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
})
