import { fireEvent, render, screen } from '@testing-library/react-native'
import { Bell } from 'lucide-react-native'

import { IconButton } from '../icon-button'

const LABEL = 'Notifications'

describe('<IconButton/>', () => {
  it('Should render the icon', async () => {
    const props = {
      accessibilityLabel: LABEL,
      Icon: Bell,
      testID: 'icon-btn',
    }
    await render(<IconButton {...props} />)
    const iconElement = screen.getByTestId('icon-btn')
    expect(iconElement).toBeTruthy()
  })
  it('Should fire onPress when pressed', async () => {
    const pressHandler = jest.fn()
    const props = {
      accessibilityLabel: LABEL,
      Icon: Bell,
      onPress: pressHandler,
      testID: 'icon-btn',
    }
    await render(<IconButton {...props} />)
    const button = screen.getByTestId('icon-btn')
    await fireEvent.press(button)
    expect(pressHandler).toHaveBeenCalledTimes(1)
  })
  it('Should render badge when hasBadge is true', async () => {
    const props = {
      accessibilityLabel: LABEL,
      Icon: Bell,
      hasBadge: true,
      testID: 'icon-btn',
    }
    await render(<IconButton {...props} />)
    const badgeElement = screen.getByTestId('icon-btn-badge')
    expect(badgeElement).toBeTruthy()
  })
  it('Should not render badge when hasBadge is false', async () => {
    const props = {
      accessibilityLabel: LABEL,
      Icon: Bell,
      hasBadge: false,
      testID: 'icon-btn',
    }
    await render(<IconButton {...props} />)
    const badgeElement = screen.queryByTestId('badge')
    expect(badgeElement).toBeNull()
  })
})
