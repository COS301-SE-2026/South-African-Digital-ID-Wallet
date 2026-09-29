import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'

import type { CountdownRingProps } from './types'

const SIZE = 116
const STROKE = 7
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const WARNING_SECONDS = 15

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const CountdownRing = ({
  secondsRemaining,
  testID = 'countdown-ring',
  totalSeconds,
}: CountdownRingProps) => {
  const progress =
    totalSeconds > 0
      ? Math.min(Math.max(secondsRemaining / totalSeconds, 0), 1)
      : 0
  const isWarning = secondsRemaining <= WARNING_SECONDS

  return (
    <View className="items-center justify-center" testID={testID}>
      <Svg height={SIZE} width={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          fill="none"
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE}
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          fill="none"
          r={RADIUS}
          stroke={isWarning ? colors.danger : colors.primaryGreen}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          strokeLinecap="round"
          strokeWidth={STROKE}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text
          className={
            isWarning
              ? 'text-2xl font-bold text-danger-red'
              : 'text-2xl font-bold text-primary-green'
          }
          testID="countdown-ring-value"
        >
          {formatTime(secondsRemaining)}
        </Text>
      </View>
    </View>
  )
}
