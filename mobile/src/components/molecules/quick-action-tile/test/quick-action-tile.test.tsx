import { fireEvent, render, screen } from '@testing-library/react-native'
import { QrCode } from 'lucide-react-native'

import { QuickActionTile } from '../quick-action-tile'

const TILE_LABEL = 'Scan QR'
const TEST_ID = 'quick-action'

describe('<QuickActionTile/>', () => {
  it('Should render the label and icon', async () => {
    const tileProps = {
      Icon: QrCode,
      label: TILE_LABEL,
      onPress: jest.fn(),
      testID: TEST_ID,
    }
    await render(<QuickActionTile {...tileProps} />)
    const labelElement = screen.getByText(TILE_LABEL)
    const tileElement = screen.getByTestId(TEST_ID)
    expect(labelElement).toBeTruthy()
    expect(tileElement).toBeTruthy()
  })
  it('Should fire onPress when pressed', async () => {
    const handlePress = jest.fn()
    const tileProps = {
      Icon: QrCode,
      label: TILE_LABEL,
      onPress: handlePress,
      testID: TEST_ID,
    }
    await render(<QuickActionTile {...tileProps} />)
    const tile = screen.getByTestId(TEST_ID)
    await fireEvent.press(tile)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })
})
