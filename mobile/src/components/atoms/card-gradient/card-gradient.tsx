import { useId } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import type { CardGradientProps } from './types'

export const CardGradient = ({
  from,
  radius = 24,
  testID = 'card-gradient',
  to,
}: CardGradientProps) => {
  const gradientId = `grad-${useId().replace(/:/g, '')}`
  return (
    <Svg style={StyleSheet.absoluteFill} testID={testID}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect
        fill={`url(#${gradientId})`}
        height="100%"
        rx={radius}
        ry={radius}
        width="100%"
        x="0"
        y="0"
      />
    </Svg>
  )
}
