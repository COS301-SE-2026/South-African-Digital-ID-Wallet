import { fireEvent, render, screen } from '@testing-library/react-native'
import { Settings } from 'lucide-react-native'

import { SettingsRow } from '../settings-row'

describe('<SettingsRow/>', () => {
  it('Should render the label as its accessible name', async () => {
    await render(
      <SettingsRow
        Icon={Settings}
        label="Security"
        onPress={jest.fn()}
        testID="row"
      />
    )
    expect(screen.getByLabelText('Security')).toBeTruthy()
  })
  it('Should fire onPress', async () => {
    const onPress = jest.fn()
    await render(
      <SettingsRow
        Icon={Settings}
        label="Security"
        onPress={onPress}
        testID="row"
      />
    )
    await fireEvent.press(screen.getByTestId('row'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
