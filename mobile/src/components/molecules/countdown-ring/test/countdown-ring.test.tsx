import { render, screen } from '@testing-library/react-native'

import { CountdownRing } from '../countdown-ring'

const value = () => screen.getByTestId('countdown-ring-value').props.children

describe('<CountdownRing/>', () => {
  it('Should format the remaining seconds as mm:ss', async () => {
    await render(<CountdownRing secondsRemaining={65} totalSeconds={120} />)
    expect(value()).toBe('01:05')
  })
  it('Should zero-pad a sub-minute value', async () => {
    await render(<CountdownRing secondsRemaining={9} totalSeconds={60} />)
    expect(value()).toBe('00:09')
  })
  it('Should clamp at zero', async () => {
    await render(<CountdownRing secondsRemaining={0} totalSeconds={60} />)
    expect(value()).toBe('00:00')
  })
  it('Should render with a zero total without dividing by zero', async () => {
    await render(<CountdownRing secondsRemaining={0} totalSeconds={0} />)
    expect(screen.getByTestId('countdown-ring')).toBeTruthy()
  })
  it('Should honour a custom testID', async () => {
    await render(
      <CountdownRing secondsRemaining={30} testID="ring" totalSeconds={60} />
    )
    expect(screen.getByTestId('ring')).toBeTruthy()
  })
})
