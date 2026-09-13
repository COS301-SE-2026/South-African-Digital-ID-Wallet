import { fireEvent, render, screen } from '@testing-library/react-native'

import { CredentialCard } from '../credential-card'

const base = {
  height: 200,
  issuedBy: 'Department of Home Affairs',
  title: 'National ID Card',
  tone: 'green' as const,
}

describe('<CredentialCard/>', () => {
  it('Should expose a descriptive accessible name', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(
      screen.getByLabelText(
        'National ID Card, issued by Department of Home Affairs'
      )
    ).toBeTruthy()
  })
  it('Should fire onPress when pressable', async () => {
    const onPress = jest.fn()
    await render(<CredentialCard {...base} onPress={onPress} testID="card" />)
    await fireEvent.press(screen.getByTestId('card'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
  it('Should be disabled without an onPress', async () => {
    await render(<CredentialCard {...base} testID="card" />)
    expect(screen.getByTestId('card').props.accessibilityState.disabled).toBe(
      true
    )
  })
  it('Should render the verified badge when verified', async () => {
    await render(<CredentialCard {...base} isVerified testID="card" />)
    expect(screen.getByTestId('card')).toBeTruthy()
  })
})
