import { fireEvent, render, screen } from '@testing-library/react-native'
import { ShieldAlert } from 'lucide-react-native'

import { SecurityActivityRow } from '@/components/molecules/security-activity-row'

const TITLE = 'Signed in'

describe('<SecurityActivityRow/>', () => {
  it('Should show the title, location and time', async () => {
    await render(
      <SecurityActivityRow
        description="London, United Kingdom"
        Icon={ShieldAlert}
        timestamp="14 May, 16:22"
        title={TITLE}
        tone="soft-red"
      />
    )
    expect(screen.getByText(TITLE)).toBeTruthy()
    expect(screen.getByText('London, United Kingdom')).toBeTruthy()
    expect(screen.getByText('14 May, 16:22')).toBeTruthy()
  })

  it('Should show the risk badge when there is one', async () => {
    await render(
      <SecurityActivityRow
        badge={{ label: 'High', tone: 'danger' }}
        Icon={ShieldAlert}
        timestamp="Today"
        title={TITLE}
        tone="soft-red"
      />
    )
    expect(screen.getByText('High')).toBeTruthy()
  })

  it('Should leave the badge out when there is none', async () => {
    await render(
      <SecurityActivityRow
        badge={null}
        Icon={ShieldAlert}
        timestamp="Today"
        title={TITLE}
        tone="soft-green"
      />
    )
    expect(screen.queryByText('High')).toBeNull()
  })

  it('Should act as a button only when it can be pressed', async () => {
    const onPress = jest.fn()
    await render(
      <SecurityActivityRow
        Icon={ShieldAlert}
        onPress={onPress}
        timestamp="Today"
        title={TITLE}
        tone="soft-red"
      />
    )
    await fireEvent.press(screen.getByRole('button', { name: TITLE }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Should not be a button without onPress', async () => {
    await render(
      <SecurityActivityRow
        Icon={ShieldAlert}
        timestamp="Today"
        title={TITLE}
        tone="soft-red"
      />
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})
