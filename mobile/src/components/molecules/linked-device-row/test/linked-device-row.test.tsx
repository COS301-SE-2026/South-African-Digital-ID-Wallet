import { fireEvent, render, screen } from '@testing-library/react-native'

import { LinkedDeviceRow } from '../linked-device-row'

const base = {
  isCurrent: false,
  lastActive: '2 hours ago',
  location: 'Pretoria',
  name: 'iPhone 15',
  onUnlink: jest.fn(),
}

describe('<LinkedDeviceRow/>', () => {
  it('Should join the location and last-active into one line', async () => {
    await render(<LinkedDeviceRow {...base} testID="row" />)
    expect(screen.getByText('Pretoria · 2 hours ago')).toBeTruthy()
  })
  it('Should mark the current device and hide unlink', async () => {
    await render(<LinkedDeviceRow {...base} isCurrent testID="row" />)
    expect(screen.getByText('This device')).toBeTruthy()
    expect(screen.queryByTestId('row-unlink')).toBeNull()
  })
  it('Should offer unlink for another device', async () => {
    const onUnlink = jest.fn()
    await render(<LinkedDeviceRow {...base} onUnlink={onUnlink} testID="row" />)
    await fireEvent.press(screen.getByTestId('row-unlink'))
    expect(onUnlink).toHaveBeenCalledTimes(1)
  })
  it('Should disable unlink while unlinking', async () => {
    await render(<LinkedDeviceRow {...base} isUnlinking testID="row" />)
    expect(
      screen.getByTestId('row-unlink').props.accessibilityState.disabled
    ).toBe(true)
  })
})
