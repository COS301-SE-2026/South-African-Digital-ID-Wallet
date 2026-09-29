import { fireEvent, render, screen } from '@testing-library/react-native'

import { SecurityAlertBanner } from '@/components/organisms/security-alert-banner'

const TITLE = 'Possible impossible travel'

describe('<SecurityAlertBanner/>', () => {
  it('Should show the title, message, badge and footer', async () => {
    await render(
      <SecurityAlertBanner
        badge={{ label: 'High', tone: 'danger' }}
        footer={['Risk score: 90/100']}
        message="We detected a sign-in from London."
        title={TITLE}
      />
    )
    expect(screen.getByText(TITLE)).toBeTruthy()
    expect(screen.getByText('We detected a sign-in from London.')).toBeTruthy()
    expect(screen.getByText('High')).toBeTruthy()
    expect(screen.getByText('Risk score: 90/100')).toBeTruthy()
  })

  it('Should be a button named after the title when pressable', async () => {
    const onPress = jest.fn()
    await render(
      <SecurityAlertBanner message="message" onPress={onPress} title={TITLE} />
    )
    await fireEvent.press(screen.getByRole('button', { name: TITLE }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Should not be a button without onPress', async () => {
    await render(
      <SecurityAlertBanner
        message="You secured your account."
        title={TITLE}
        tone="success"
      />
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('You secured your account.')).toBeTruthy()
  })
})
