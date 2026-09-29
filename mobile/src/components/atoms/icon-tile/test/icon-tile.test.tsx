import { render, screen } from '@testing-library/react-native'
import { ShieldCheck } from 'lucide-react-native'

import { IconTile } from '../icon-tile'
import type { IconTileTone } from '../types'

const ALL_AVAILABLE_TONES: IconTileTone[] = [
  'green',
  'gold',
  'blue',
  'red',
  'soft-green',
  'soft-amber',
  'soft-red',
  'neutral',
]

describe('<IconTile/>', () => {
  it('Should render every tone without crashing', async () => {
    const renderedTones = ALL_AVAILABLE_TONES.map((tone) => (
      <IconTile Icon={ShieldCheck} key={tone} testID={tone} tone={tone} />
    ))
    await render(<>{renderedTones}</>)
    ALL_AVAILABLE_TONES.forEach((currentTone) => {
      const element = screen.getByTestId(currentTone)
      expect(element).toBeTruthy()
    })
  })
  it('Should render with green tone', async () => {
    const component = <IconTile Icon={ShieldCheck} testID="tile" tone="green" />
    await render(component)
    const result = screen.getByTestId('tile')
    expect(result).toBeTruthy()
  })
  it('Should render with soft-green tone', async () => {
    const component = (
      <IconTile Icon={ShieldCheck} testID="tile" tone="soft-green" />
    )
    await render(component)
    const result = screen.getByTestId('tile')
    expect(result).toBeTruthy()
  })
  it('Should render with size prop', async () => {
    const component = <IconTile Icon={ShieldCheck} size="lg" testID="tile" />
    await render(component)
    const result = screen.getByTestId('tile')
    expect(result).toBeTruthy()
  })
})
