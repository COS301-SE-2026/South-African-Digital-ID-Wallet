import { fireEvent, render, screen } from '@testing-library/react-native'

import { SecurityStatusCard } from '@/components/organisms/security-status-card'

describe('<SecurityStatusCard/>', () => {
  it('Should show neither status while loading', async () => {
    await render(<SecurityStatusCard activeAlertCount={0} isPending />)
    expect(screen.queryByTestId('security-status-card')).toBeNull()
    expect(screen.queryByText('Your account is at risk')).toBeNull()
    expect(screen.queryByText('Your account is protected')).toBeNull()
  })

  it('Should warn that the account is at risk and open the alert', async () => {
    const onPress = jest.fn()
    await render(
      <SecurityStatusCard
        activeAlertCount={2}
        alertTitle="Possible impossible travel"
        isPending={false}
        onPress={onPress}
      />
    )
    expect(screen.getByText('Your account is at risk')).toBeTruthy()
    expect(screen.getByText('2 active security alerts')).toBeTruthy()
    expect(screen.getByText('Latest: Possible impossible travel')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Should use the singular for one alert', async () => {
    await render(<SecurityStatusCard activeAlertCount={1} isPending={false} />)
    expect(screen.getByText('1 active security alert')).toBeTruthy()
  })

  it('Should show the account as protected without alerts', async () => {
    await render(
      <SecurityStatusCard
        activeAlertCount={0}
        isPending={false}
        onPress={jest.fn()}
      />
    )
    expect(screen.getByText('Your account is protected')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })
})
