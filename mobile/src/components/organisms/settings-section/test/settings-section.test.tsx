import { fireEvent, render, screen } from '@testing-library/react-native'
import { Bell, Lock } from 'lucide-react-native'

import { SettingsSection } from '../settings-section'

const ROWS = [
  { Icon: Lock, label: 'Security', name: 'security', onPress: jest.fn() },
  {
    Icon: Bell,
    label: 'Notifications',
    name: 'notifications',
    onPress: jest.fn(),
  },
]

describe('<SettingsSection/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should render nothing when there are no rows', async () => {
    await render(<SettingsSection rows={[]} testID="section" title="Account" />)
    expect(screen.queryByTestId('section')).toBeNull()
  })
  it('Should render the title and every row', async () => {
    await render(
      <SettingsSection rows={ROWS} testID="section" title="Account" />
    )
    expect(screen.getByText('Account')).toBeTruthy()
    expect(screen.getByTestId('settings-row-security')).toBeTruthy()
    expect(screen.getByTestId('settings-row-notifications')).toBeTruthy()
  })
  it('Should invoke the row handler', async () => {
    await render(
      <SettingsSection rows={ROWS} testID="section" title="Account" />
    )
    await fireEvent.press(screen.getByTestId('settings-row-security'))
    expect(ROWS[0].onPress).toHaveBeenCalledTimes(1)
  })
})
