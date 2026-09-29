import { fireEvent, render, screen } from '@testing-library/react-native'
import { KeyRound } from 'lucide-react-native'

import { SecureActionOption } from '../secure-action-option'

const TITLE = 'Reset your password'

describe('<SecureActionOption/>', () => {
  it('Should call onPress when tapped', async () => {
    const onPress = jest.fn()
    await render(
      <SecureActionOption
        description="Create a new, secure password for your account."
        Icon={KeyRound}
        isSelected={false}
        onPress={onPress}
        title={TITLE}
      />
    )
    await fireEvent.press(screen.getByRole('radio', { name: TITLE }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Should expose the checked state to screen readers', async () => {
    await render(
      <SecureActionOption
        description="description"
        Icon={KeyRound}
        isSelected
        onPress={jest.fn()}
        title={TITLE}
      />
    )
    expect(screen.getByRole('radio', { name: TITLE })).toBeChecked()
  })

  it('Should show the Recommended pill only when recommended', async () => {
    await render(
      <SecureActionOption
        description="description"
        Icon={KeyRound}
        isRecommended
        isSelected={false}
        onPress={jest.fn()}
        title={TITLE}
      />
    )
    expect(screen.getByText('Recommended')).toBeTruthy()
  })
})
