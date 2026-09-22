import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text as RNText } from 'react-native'

import { SettingsSheet } from '../settings-sheet'

const setup = async (
  props: Partial<Parameters<typeof SettingsSheet>[0]> = {}
) => {
  const onClose = jest.fn()
  await render(
    <SettingsSheet isVisible onClose={onClose} title="Security" {...props}>
      <RNText>body</RNText>
    </SettingsSheet>
  )
  return onClose
}

describe('<SettingsSheet/>', () => {
  it('Should render the title and children', async () => {
    await setup()
    expect(screen.getByText('Security')).toBeTruthy()
    expect(screen.getByText('body')).toBeTruthy()
  })
  it('Should render an optional subtitle', async () => {
    await setup({ subtitle: 'Manage your device' })
    expect(screen.getByText('Manage your device')).toBeTruthy()
  })
  it('Should omit the subtitle when not given', async () => {
    await setup()
    expect(screen.queryByText('Manage your device')).toBeNull()
  })
  it('Should render an optional footer', async () => {
    await setup({ footer: <RNText>footer</RNText> })
    expect(screen.getByText('footer')).toBeTruthy()
  })
  it('Should close from the backdrop', async () => {
    const onClose = await setup()
    await fireEvent.press(screen.getByTestId('settings-sheet-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Should close from the header button', async () => {
    const onClose = await setup()
    await fireEvent.press(screen.getByTestId('settings-sheet-close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
