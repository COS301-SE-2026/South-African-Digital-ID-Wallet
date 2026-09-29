import { fireEvent, render, screen } from '@testing-library/react-native'
import { CircleCheck, ShieldAlert } from 'lucide-react-native'

import { SecurityActivityList } from '@/components/organisms/security-activity-list'
import type { SecurityActivityEntry } from '@/services/security-service'

const ENTRIES: SecurityActivityEntry[] = [
  {
    badge: { label: 'High', tone: 'danger' },
    description: 'London, United Kingdom',
    Icon: ShieldAlert,
    id: 'event-1',
    timestamp: 'Today, 16:22',
    title: 'Signed in',
    tone: 'soft-red',
  },
  {
    badge: null,
    description: 'Pretoria, South Africa',
    Icon: CircleCheck,
    id: 'event-2',
    timestamp: 'Yesterday',
    title: 'QR code generated',
    tone: 'soft-green',
  },
]

const TITLE = 'Recent security activity'

describe('<SecurityActivityList/>', () => {
  it('Should show placeholders while loading', async () => {
    await render(
      <SecurityActivityList
        entries={[]}
        isError={false}
        isPending
        title={TITLE}
      />
    )
    expect(screen.getByTestId('security-activity-loading')).toBeTruthy()
  })

  it('Should explain when the activity cannot be loaded', async () => {
    await render(
      <SecurityActivityList
        entries={[]}
        isError
        isPending={false}
        title={TITLE}
      />
    )
    expect(
      screen.getByText('We could not load your security activity.')
    ).toBeTruthy()
  })

  it('Should say when there is no activity yet', async () => {
    await render(
      <SecurityActivityList
        entries={[]}
        isError={false}
        isPending={false}
        title={TITLE}
      />
    )
    expect(screen.getByText('No security activity yet.')).toBeTruthy()
  })

  it('Should list every entry with its badge', async () => {
    await render(
      <SecurityActivityList
        entries={ENTRIES}
        isError={false}
        isPending={false}
        title={TITLE}
      />
    )
    expect(screen.getByText(TITLE)).toBeTruthy()
    expect(screen.getByTestId('security-activity-event-1')).toBeTruthy()
    expect(screen.getByTestId('security-activity-event-2')).toBeTruthy()
    expect(screen.getAllByText('High')).toHaveLength(1)
  })

  it('Should call the header action', async () => {
    const onActionPress = jest.fn()
    await render(
      <SecurityActivityList
        actionLabel="See all"
        entries={ENTRIES}
        isError={false}
        isPending={false}
        onActionPress={onActionPress}
        title={TITLE}
      />
    )
    await fireEvent.press(screen.getByText('See all'))
    expect(onActionPress).toHaveBeenCalledTimes(1)
  })
})
