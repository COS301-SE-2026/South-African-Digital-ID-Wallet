import { fireEvent, render, screen } from '@testing-library/react-native'
import { ShieldCheck } from 'lucide-react-native'

import { StatusSummaryCard } from '../status-summary-card'

const LABEL_TEXT = 'Identity Status'
const VALUE_TEXT = 'Verified'
const DESC_TEXT = 'Your identity is fully verified'
const TEST_ID = 'status'

describe('<StatusSummaryCard/>', () => {
  it('Should render the label, value and description', async () => {
    const cardProps = {
      description: DESC_TEXT,
      Icon: ShieldCheck,
      label: LABEL_TEXT,
      value: VALUE_TEXT,
    }
    await render(<StatusSummaryCard {...cardProps} />)
    expect(screen.getByText(LABEL_TEXT)).toBeTruthy()
    expect(screen.getByText(VALUE_TEXT)).toBeTruthy()
    expect(screen.getByText(DESC_TEXT)).toBeTruthy()
  })
  it('Should fire onPress and expose a combined accessibility label', async () => {
    const handlePress = jest.fn()
    const cardProps = {
      Icon: ShieldCheck,
      label: LABEL_TEXT,
      onPress: handlePress,
      testID: TEST_ID,
      value: VALUE_TEXT,
    }
    await render(<StatusSummaryCard {...cardProps} />)
    const card = screen.getByTestId(TEST_ID)
    await fireEvent.press(card)
    expect(handlePress).toHaveBeenCalledTimes(1)
    const combinedLabel = `${LABEL_TEXT}: ${VALUE_TEXT}`
    expect(screen.getByLabelText(combinedLabel)).toBeTruthy()
  })
})
