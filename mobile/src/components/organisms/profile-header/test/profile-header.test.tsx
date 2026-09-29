import { render, screen } from '@testing-library/react-native'

import { ProfileHeader } from '../profile-header'

describe('<ProfileHeader/>', () => {
  it('Should render the identity block', async () => {
    await render(
      <ProfileHeader
        email="thabo@flashid.co.za"
        initials="TM"
        name="Thabo Mokoena"
        roleLabel="Citizen"
      />
    )
    expect(screen.getByText('TM')).toBeTruthy()
    expect(screen.getByText('Thabo Mokoena')).toBeTruthy()
    expect(screen.getByText('thabo@flashid.co.za')).toBeTruthy()
    expect(screen.getByText('Citizen')).toBeTruthy()
  })
})
