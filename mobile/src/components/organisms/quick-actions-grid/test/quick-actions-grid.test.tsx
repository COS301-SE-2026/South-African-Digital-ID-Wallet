import { fireEvent, render, screen } from '@testing-library/react-native'

import { citizenQuickActions } from '@/config/navigation'

import { QuickActionsGrid } from '../quick-actions-grid'

const GRID_LABEL = 'Quick Actions'
const SHARE_ID_TESTID = 'quick-actions-share-id'
const selectCallback = jest.fn()

describe('<QuickActionsGrid/>', () => {
  it('Should render a tile per configured action', async () => {
    const gridProps = {
      actions: citizenQuickActions,
      onSelect: selectCallback,
    }
    await render(<QuickActionsGrid {...gridProps} />)
    const gridTitle = screen.getByText(GRID_LABEL)
    expect(gridTitle).toBeTruthy()
    citizenQuickActions.forEach((action) => {
      const actionTile = screen.getByTestId(`quick-actions-${action.name}`)
      expect(actionTile).toBeTruthy()
    })
  })
  it('Should hand the pressed action back to the caller', async () => {
    const onSelectFn = jest.fn()
    const gridProps = {
      actions: citizenQuickActions,
      onSelect: onSelectFn,
    }
    await render(<QuickActionsGrid {...gridProps} />)
    const shareIdTile = screen.getByTestId(SHARE_ID_TESTID)
    await fireEvent.press(shareIdTile)
    const expectedAction = citizenQuickActions.find(
      (action) => action.name === 'share-id'
    )
    expect(onSelectFn).toHaveBeenCalledWith(expectedAction)
  })
})
