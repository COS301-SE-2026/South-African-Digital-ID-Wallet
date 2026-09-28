import { fireEvent, render, screen } from '@testing-library/react-native'

import { FieldToggleRow } from '../field-toggle-row'

describe('<FieldToggleRow/>', () => {
  it('Should render the label and current value', async () => {
    await render(
      <FieldToggleRow isOn label="Gender" onToggle={jest.fn()} testID="row" />
    )
    expect(screen.getByText('Gender')).toBeTruthy()
    expect(screen.getByTestId('row-switch').props.value).toBe(true)
  })
  it('Should emit the next value on toggle', async () => {
    const onToggle = jest.fn()
    await render(
      <FieldToggleRow
        isOn={false}
        label="Gender"
        onToggle={onToggle}
        testID="row"
      />
    )
    await fireEvent(screen.getByTestId('row-switch'), 'valueChange', true)
    expect(onToggle).toHaveBeenCalledWith(true)
  })
  it('Should disable the switch when locked', async () => {
    await render(<FieldToggleRow isLocked isOn label="Photo" testID="row" />)
    expect(screen.getByTestId('row-switch').props.disabled).toBe(true)
  })
})
