import { fireEvent, render, screen } from '@testing-library/react-native'

import { TextField } from '../text-field'

describe('<TextField/>', () => {
  it('Should toggle password visibility', async () => {
    await render(<TextField secure value="" onChangeText={jest.fn()} />)
    await fireEvent.press(screen.getByLabelText('Show password'))
    expect(screen.getByLabelText('Hide password')).toBeTruthy()
  })
  it('Should surface a field error', async () => {
    await render(
      <TextField error="Required" value="" onChangeText={jest.fn()} />
    )
    expect(screen.getByText('Required')).toBeTruthy()
  })
})
