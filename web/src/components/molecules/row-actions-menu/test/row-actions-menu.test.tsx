import { render, screen, fireEvent } from '@testing-library/react'
import { RowActionsMenu } from '../row-actions-menu'

describe('RowActionsMenu', () => {
  it('opens and triggers an action', () => {
    const onClick = jest.fn()
    render(<RowActionsMenu actions={[{ label: 'Suspend', onClick }]} />)
    fireEvent.click(screen.getByLabelText('Row actions'))
    fireEvent.click(screen.getByText('Suspend'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
