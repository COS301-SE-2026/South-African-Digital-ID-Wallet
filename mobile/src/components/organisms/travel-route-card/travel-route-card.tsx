import Svg, { Circle, Path } from 'react-native-svg'
import { View } from 'react-native'
import { Text } from '@/components/atoms'
import { colors } from '@/theme/colors'
import type { TravelRouteCardProps } from './types'

export const TravelRouteCard = ({
  from,
  testID = 'travel-route-card',
  to,
}: TravelRouteCardProps) => (
  <View
    accessible
    accessibilityLabel={`Travelled from ${from} to ${to}`}
    className="overflow-hidden rounded-2xl border border-border-grey bg-national-blue/5"
    testID={testID}
  >
    {/* A drawn route, not a real map, so no map SDK or API key is needed */}
    <Svg height={140} viewBox="0 0 300 140" width="100%">
      <Path
        d="M 50 110 Q 150 10 250 40"
        fill="none"
        stroke={colors.textPrimary}
        strokeDasharray="6 6"
        strokeWidth={2}
      />
      <Circle
        cx={50}
        cy={110}
        fill={colors.white}
        r={7}
        stroke={colors.danger}
        strokeWidth={3}
      />
      <Circle cx={250} cy={40} fill={colors.danger} r={9} />
    </Svg>
    <View className="flex-row justify-between px-4 pb-3">
      <Text variant="caption" className="font-semibold text-text-primary">
        {from}
      </Text>
      <Text variant="caption" className="font-semibold text-text-primary">
        {to}
      </Text>
    </View>
  </View>
)
