import { fireEvent, render, screen } from '@testing-library/react-native'

import { SegmentedTabs } from '../segmented-tabs'

const TABS = [
  { label: 'All', name: 'all' },
  { label: 'Shared', name: 'shared' },
]

describe('<SegmentedTabs/>', () => {
  it('Should mark the active option as selected', async () => {
    await render(
      <SegmentedTabs activeName="shared" onChange={jest.fn()} options={TABS} />
    )
    expect(
      screen.getByTestId('segmented-tabs-shared').props.accessibilityState
        .selected
    ).toBe(true)
    expect(
      screen.getByTestId('segmented-tabs-all').props.accessibilityState.selected
    ).toBe(false)
  })

  it('Should emit the tapped option name', async () => {
    const onChange = jest.fn()
    await render(
      <SegmentedTabs activeName="all" onChange={onChange} options={TABS} />
    )
    await fireEvent.press(screen.getByTestId('segmented-tabs-shared'))
    expect(onChange).toHaveBeenCalledWith('shared')
  })
})
