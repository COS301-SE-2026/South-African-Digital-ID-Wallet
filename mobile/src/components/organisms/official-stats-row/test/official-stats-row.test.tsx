import { render, screen } from '@testing-library/react-native'

import { OfficialStatsRow } from '../official-stats-row'

describe('<OfficialStatsRow/>', () => {
  it('Should render the plain count and default caption', async () => {
    await render(<OfficialStatsRow isCapped={false} todayCount={7} />)
    expect(screen.getByText('7')).toBeTruthy()
    expect(
      screen.getByText('Checks completed at your institution today')
    ).toBeTruthy()
  })
  it('Should suffix a capped count and explain it', async () => {
    await render(<OfficialStatsRow isCapped todayCount={50} />)
    expect(screen.getByText('50+')).toBeTruthy()
    expect(screen.getByText('Showing recent activity only')).toBeTruthy()
  })
  it('Should show a dash and an error caption on failure', async () => {
    await render(<OfficialStatsRow isCapped={false} isError todayCount={7} />)
    expect(screen.getByText('—')).toBeTruthy()
    expect(
      screen.getByText('We could not load your stats. Pull down to try again.')
    ).toBeTruthy()
  })
  it('Should hide the count while pending', async () => {
    await render(<OfficialStatsRow isCapped={false} isPending todayCount={7} />)
    expect(screen.queryByText('7')).toBeNull()
    expect(screen.getByTestId('official-stats-row')).toBeTruthy()
  })
})
