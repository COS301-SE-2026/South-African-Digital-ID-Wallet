import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { Card } from '../card'

const CARD_ID = 'card'
const CARD_CONTENT = 'content'
const CARD_LABEL = 'Open'

describe('<Card/>', () => {
  it('Should render as a plain surface without onPress', async () => {
    const cardElement = (
      <Card testID={CARD_ID}>
        <Text>{CARD_CONTENT}</Text>
      </Card>
    )
    await render(cardElement)
    const textElement = screen.getByText(CARD_CONTENT)
    const cardProps = screen.getByTestId(CARD_ID).props
    expect(textElement).toBeTruthy()
    expect(cardProps.accessibilityRole).toBeUndefined()
  })
  it('Should become a button and fire onPress when pressable', async () => {
    const pressCallback = jest.fn()
    const cardElement = (
      <Card
        accessibilityLabel={CARD_LABEL}
        onPress={pressCallback}
        testID={CARD_ID}
      >
        <Text>{CARD_CONTENT}</Text>
      </Card>
    )
    await render(cardElement)
    const cardNode = screen.getByTestId(CARD_ID)
    await fireEvent.press(cardNode)
    expect(pressCallback).toHaveBeenCalledTimes(1)
    const labeledElement = screen.getByLabelText(CARD_LABEL)
    expect(labeledElement).toBeTruthy()
  })
})
