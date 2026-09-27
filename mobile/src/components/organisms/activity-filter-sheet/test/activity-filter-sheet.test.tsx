import { fireEvent, render, screen } from '@testing-library/react-native'

import { ActivityFilterSheet } from '../activity-filter-sheet'

describe('<ActivityFilterSheet/>', () => {
  it('Should mark the active range as selected', async () => {
    await render(
      <ActivityFilterSheet
        isVisible
        onClose={jest.fn()}
        onSelect={jest.fn()}
        range="7d"
      />
    )
    expect(
      screen.getByTestId('activity-filter-sheet-7d').props.accessibilityState
        .selected
    ).toBe(true)
    expect(
      screen.getByTestId('activity-filter-sheet-all').props.accessibilityState
        .selected
    ).toBe(false)
  })
  it('Should emit the chosen range and close', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    await render(
      <ActivityFilterSheet
        isVisible
        onClose={onClose}
        onSelect={onSelect}
        range="all"
      />
    )
    await fireEvent.press(screen.getByTestId('activity-filter-sheet-30d'))
    expect(onSelect).toHaveBeenCalledWith('30d')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Should offer every range option', async () => {
    await render(
      <ActivityFilterSheet
        isVisible
        onClose={jest.fn()}
        onSelect={jest.fn()}
        range="all"
      />
    )
    expect(screen.getByText('All time')).toBeTruthy()
    expect(screen.getByText('Last 7 days')).toBeTruthy()
    expect(screen.getByText('Last 30 days')).toBeTruthy()
  })
})
