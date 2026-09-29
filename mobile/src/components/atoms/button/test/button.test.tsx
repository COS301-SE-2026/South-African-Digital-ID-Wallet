import { fireEvent, render, screen } from '@testing-library/react-native'

import { Button } from '../button'

describe('<Button/>', () => {
  it('Should render each variant and fire onPress', async () => {
    const onPress = jest.fn()
    await render(
      <>
        <Button label="Primary" onPress={onPress} testID="p" />
        <Button
          label="Secondary"
          variant="secondary"
          onPress={onPress}
          testID="s"
        />
        <Button label="Textual" variant="text" onPress={onPress} testID="t" />
      </>
    )
    for (const id of ['p', 's', 't']) {
      await fireEvent.press(screen.getByTestId(id))
    }
    expect(onPress).toHaveBeenCalledTimes(3)
  })
  it('Should block presses while loading or disabled', async () => {
    const onPress = jest.fn()
    await render(
      <>
        <Button label="Load" isLoading onPress={onPress} testID="loading" />
        <Button label="Off" disabled onPress={onPress} testID="off" />
      </>
    )
    expect(screen.getByTestId('loading').props.accessibilityState.busy)
    await fireEvent.press(screen.getByTestId('off'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
