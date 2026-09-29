import type { SecurityStat } from '@/services/security-service'

export type TravelPoint = {
  caption?: string
  label: string
  latitude?: number | null
  longitude?: number | null
  name?: string
}

export type MapPoint = {
  latitude: number
  longitude: number
  name: string
}

export type TravelMapProps = {
  from: MapPoint
  to: MapPoint
}

export type TravelRouteCardProps = {
  from: TravelPoint
  stats?: SecurityStat[]
  testID?: string
  to: TravelPoint
  warning?: string
}
