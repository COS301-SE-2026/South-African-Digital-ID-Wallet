import { CircleAlert } from 'lucide-react-native'
import { View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { Text } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'
import { TravelMap } from './travel-map'
import type { MapPoint, TravelPoint, TravelRouteCardProps } from './types'

const isNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number'

const toMapPoint = (point: TravelPoint): MapPoint | null =>
  isNumber(point.latitude) && isNumber(point.longitude)
    ? {
        latitude: point.latitude,
        longitude: point.longitude,
        name: point.name ?? point.label,
      }
    : null

const RouteSketch = () => (
  <Svg height={140} viewBox="0 0 300 140" width="100%">
    <Path
      d="M 0 45 H 300 M 0 95 H 300"
      stroke={colors.border}
      strokeDasharray="2 6"
      strokeWidth={1}
    />
    <Path
      d="M 50 110 Q 150 10 250 40"
      fill="none"
      stroke={colors.danger}
      strokeDasharray="6 6"
      strokeWidth={2}
    />
    <Circle
      cx={50}
      cy={110}
      fill={colors.primaryGreen}
      r={7}
      stroke={colors.white}
      strokeWidth={3}
    />
    <Circle
      cx={250}
      cy={40}
      fill={colors.danger}
      r={10}
      stroke={colors.white}
      strokeWidth={3}
    />
    <Circle cx={250} cy={40} fill={colors.white} r={3} />
  </Svg>
)

const TravelPointLabel = ({
  dotClassName,
  heading,
  point,
}: {
  dotClassName: string
  heading: string
  point: TravelPoint
}) => (
  <View className="flex-1 gap-1">
    <View className="flex-row items-center gap-1.5">
      <View className={cn('h-2.5 w-2.5 rounded-full', dotClassName)} />
      <Text variant="caption">{heading}</Text>
    </View>
    <Text variant="sub-sm" className="font-semibold text-text-primary">
      {point.label}
    </Text>
    {point.caption ? <Text variant="caption">{point.caption}</Text> : null}
  </View>
)

export const TravelRouteCard = ({
  from,
  stats = [],
  testID = 'travel-route-card',
  to,
  warning,
}: TravelRouteCardProps) => {
  const start = toMapPoint(from)
  const end = toMapPoint(to)

  return (
    <View
      className="overflow-hidden rounded-2xl border border-border-grey bg-clean-white"
      testID={testID}
    >
      <View
        accessible
        accessibilityLabel={`Travelled from ${from.label} to ${to.label}`}
        className="bg-national-blue/5"
        testID={`${testID}-${start && end ? 'map' : 'sketch'}`}
      >
        {start && end ? <TravelMap from={start} to={end} /> : <RouteSketch />}
      </View>
      <View className="flex-row gap-4 p-4">
        <TravelPointLabel
          dotClassName="bg-primary-green"
          heading="Previous location"
          point={from}
        />
        <TravelPointLabel
          dotClassName="bg-danger-red"
          heading="Suspicious location"
          point={to}
        />
      </View>
      {stats.length > 0 ? (
        <View className="flex-row border-t border-border-grey">
          {stats.map((stat, index) => (
            <View
              className={cn(
                'flex-1 gap-0.5 px-3 py-3',
                index > 0 && 'border-l border-border-grey'
              )}
              key={stat.label}
            >
              <Text variant="caption">{stat.label}</Text>
              <Text variant="sub-sm" className="font-bold text-text-primary">
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {warning ? (
        <View className="flex-row gap-2 border-t border-danger-red/20 bg-danger-red/10 p-4">
          <CircleAlert color={colors.danger} size={18} />
          <Text variant="sub-sm" className="flex-1 text-danger-red">
            {warning}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
