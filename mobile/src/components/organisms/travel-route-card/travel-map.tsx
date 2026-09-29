import { useMemo } from 'react'
import { geoGraticule10, geoMercator, geoPath } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg'
import { feature } from 'topojson-client'
import land from 'world-atlas/land-110m.json'

import { colors } from '@/theme/colors'

import type { TravelMapProps } from './types'

const WIDTH = 300
const HEIGHT = 170
const EDGE = 28
const MIN_PADDING_DEGREES = 8

type Coordinates = [longitude: number, latitude: number]
type Topology = Parameters<typeof feature>[0]

const topology = land as unknown as Topology
const LAND = feature(topology, topology.objects.land)
const GRATICULE = geoGraticule10()

const fitArea = (
  start: Coordinates,
  end: Coordinates
): GeoPermissibleObjects => {
  const longitudes = [start[0], end[0]]
  const latitudes = [start[1], end[1]]
  const pad = Math.max(
    MIN_PADDING_DEGREES,
    (Math.max(...latitudes) - Math.min(...latitudes)) * 0.15
  )
  return {
    coordinates: [
      [
        Math.min(...longitudes) - pad,
        Math.max(-80, Math.min(...latitudes) - pad),
      ],
      [
        Math.max(...longitudes) + pad,
        Math.min(80, Math.max(...latitudes) + pad),
      ],
    ],
    type: 'MultiPoint',
  }
}

export const TravelMap = ({ from, to }: TravelMapProps) => {
  const map = useMemo(() => {
    const start: Coordinates = [from.longitude, from.latitude]
    const end: Coordinates = [to.longitude, to.latitude]
    const projection = geoMercator().fitExtent(
      [
        [EDGE, EDGE],
        [WIDTH - EDGE, HEIGHT - EDGE],
      ],
      fitArea(start, end)
    )
    const path = geoPath(projection)
    return {
      end: projection(end),
      graticule: path(GRATICULE) ?? '',
      land: path(LAND) ?? '',
      route: path({ coordinates: [start, end], type: 'LineString' }) ?? '',
      start: projection(start),
    }
  }, [from.latitude, from.longitude, to.latitude, to.longitude])

  return (
    <Svg height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%">
      <Path
        d={map.graticule}
        fill="none"
        stroke={colors.border}
        strokeWidth={0.5}
      />
      <Path
        d={map.land}
        fill={colors.border}
        stroke={colors.white}
        strokeWidth={0.5}
      />
      <Path
        d={map.route}
        fill="none"
        stroke={colors.danger}
        strokeDasharray="6 5"
        strokeWidth={2}
      />
      {map.start ? (
        <>
          <Circle
            cx={map.start[0]}
            cy={map.start[1]}
            fill={colors.primaryGreen}
            r={6}
            stroke={colors.white}
            strokeWidth={2.5}
          />
          <SvgText
            fill={colors.textPrimary}
            fontSize={10}
            fontWeight="600"
            textAnchor="middle"
            x={map.start[0]}
            y={map.start[1] + 18}
          >
            {from.name}
          </SvgText>
        </>
      ) : null}
      {map.end ? (
        <>
          <Circle
            cx={map.end[0]}
            cy={map.end[1]}
            fill={colors.danger}
            r={8}
            stroke={colors.white}
            strokeWidth={2.5}
          />
          <Circle cx={map.end[0]} cy={map.end[1]} fill={colors.white} r={2.5} />
          <SvgText
            fill={colors.textPrimary}
            fontSize={10}
            fontWeight="600"
            textAnchor="middle"
            x={map.end[0]}
            y={map.end[1] - 14}
          >
            {to.name}
          </SvgText>
        </>
      ) : null}
    </Svg>
  )
}
