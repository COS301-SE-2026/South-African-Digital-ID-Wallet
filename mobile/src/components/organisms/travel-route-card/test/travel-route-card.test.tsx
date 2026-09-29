import { render, screen } from '@testing-library/react-native'

import { TravelRouteCard } from '@/components/organisms/travel-route-card'
import type { TravelPoint } from '@/components/organisms/travel-route-card'

const JOHANNESBURG: TravelPoint = {
  caption: '-26.2041, 28.0473',
  label: 'Johannesburg, South Africa',
  latitude: -26.2041,
  longitude: 28.0473,
  name: 'Johannesburg',
}

const LONDON: TravelPoint = {
  caption: '51.5074, -0.1278',
  label: 'London, United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
  name: 'London',
}

describe('<TravelRouteCard/>', () => {
  it('Should draw a real map when both points have coordinates', async () => {
    await render(<TravelRouteCard from={JOHANNESBURG} to={LONDON} />)
    expect(screen.getByTestId('travel-route-card-map')).toBeTruthy()
    expect(screen.queryByTestId('travel-route-card-sketch')).toBeNull()
    expect(
      screen.getByLabelText(
        'Travelled from Johannesburg, South Africa to London, United Kingdom'
      )
    ).toBeTruthy()
  })

  it('Should fall back to a sketch when a point has no coordinates', async () => {
    await render(
      <TravelRouteCard
        from={{ ...JOHANNESBURG, latitude: null, longitude: null }}
        to={LONDON}
      />
    )
    expect(screen.getByTestId('travel-route-card-sketch')).toBeTruthy()
    expect(screen.queryByTestId('travel-route-card-map')).toBeNull()
  })

  it('Should label both locations with their captions', async () => {
    await render(<TravelRouteCard from={JOHANNESBURG} to={LONDON} />)
    expect(screen.getByText('Previous location')).toBeTruthy()
    expect(screen.getByText('Suspicious location')).toBeTruthy()
    expect(screen.getByText('Johannesburg, South Africa')).toBeTruthy()
    expect(screen.getByText('51.5074, -0.1278')).toBeTruthy()
  })

  it('Should show the travel stats and the warning', async () => {
    await render(
      <TravelRouteCard
        from={JOHANNESBURG}
        stats={[
          { label: 'Distance', value: '9,070 km' },
          { label: 'Implied speed', value: '1,118 km/h' },
        ]}
        to={LONDON}
        warning="Nobody could make this trip in that time."
      />
    )
    expect(screen.getByText('9,070 km')).toBeTruthy()
    expect(screen.getByText('1,118 km/h')).toBeTruthy()
    expect(
      screen.getByText('Nobody could make this trip in that time.')
    ).toBeTruthy()
  })

  it('Should leave out the stats and warning when there are none', async () => {
    await render(<TravelRouteCard from={JOHANNESBURG} to={LONDON} />)
    expect(screen.queryByText('Distance')).toBeNull()
    expect(
      screen.queryByText('Nobody could make this trip in that time.')
    ).toBeNull()
  })
})
