import { render, screen } from '@testing-library/react-native'

import { OfficialDashboardHeader } from '../official-dashboard-header'

describe('<OfficialDashboardHeader/>', () => {
  it('Should greet the officer and name the institution', async () => {
    await render(
      <OfficialDashboardHeader
        greeting="Good morning"
        institution="Home Affairs"
        name="Thabo"
      />
    )
    expect(screen.getByText('Good morning,')).toBeTruthy()
    expect(screen.getByText('Thabo')).toBeTruthy()
    expect(screen.getByTestId('official-institution')).toBeTruthy()
  })
  it('Should fall back when the institution is unknown', async () => {
    await render(<OfficialDashboardHeader greeting="Hello" name="Thabo" />)
    expect(screen.getByText('Institution unavailable')).toBeTruthy()
  })
  it('Should hide the institution while pending', async () => {
    await render(
      <OfficialDashboardHeader
        greeting="Hello"
        institution="Home Affairs"
        isPending
        name="Thabo"
      />
    )
    expect(screen.queryByTestId('official-institution')).toBeNull()
  })
})
