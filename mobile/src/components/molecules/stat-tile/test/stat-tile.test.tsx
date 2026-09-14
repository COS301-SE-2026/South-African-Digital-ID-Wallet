import { render, screen } from '@testing-library/react-native'
import { ShieldCheck } from 'lucide-react-native'

import { StatTile } from '../stat-tile'

describe('<StatTile/>', () => {
  it('Should render the label and value', async () => {
    await render(
      <StatTile
        Icon={ShieldCheck}
        label="Verifications"
        value="12"
        testID="tile"
      />
    )
    expect(screen.getByText('Verifications')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
  })
  it('Should hide the value while pending', async () => {
    await render(
      <StatTile
        Icon={ShieldCheck}
        isPending
        label="Verifications"
        value="12"
        testID="tile"
      />
    )
    expect(screen.queryByText('12')).toBeNull()
  })
  it('Should render an optional caption', async () => {
    await render(
      <StatTile
        Icon={ShieldCheck}
        caption="today"
        label="V"
        value="1"
        testID="tile"
      />
    )
    expect(screen.getByText('today')).toBeTruthy()
  })
  it('Should omit the caption when not given', async () => {
    await render(
      <StatTile Icon={ShieldCheck} label="V" value="1" testID="tile" />
    )
    expect(screen.queryByText('today')).toBeNull()
  })
})
