import { render, screen, fireEvent } from '@testing-library/react-native'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('calls onValueChange with the opposite value when pressed', async () => {
    const onValueChange = jest.fn()
    await render(<Toggle value={false} onValueChange={onValueChange} />)

    await fireEvent.press(screen.getByRole('switch'))

    expect(onValueChange).toHaveBeenCalledWith(true)
  })

  it('does not call onValueChange when disabled', async () => {
    const onValueChange = jest.fn()
    await render(
      <Toggle value={false} onValueChange={onValueChange} disabled />
    )

    await fireEvent.press(screen.getByRole('switch'))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
