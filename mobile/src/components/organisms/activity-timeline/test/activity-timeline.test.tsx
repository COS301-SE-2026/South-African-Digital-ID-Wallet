import { fireEvent, render, screen } from '@testing-library/react-native'
import { LogIn } from 'lucide-react-native'

import type { ActivityEntry } from '@/services/citizen-dashboard-service'

import { ActivityTimeline } from '../activity-timeline'

const entry = (id: string): ActivityEntry => ({
  category: 'login',
  description: 'Mobile App',
  Icon: LogIn,
  id,
  occurredAt: '2026-01-01T09:30:00Z',
  time: '09:30',
  timestamp: '2026-01-01T09:30:00Z',
  title: 'Logged in',
  tone: 'soft-green',
})

const GROUPS = [{ entries: [entry('a-1'), entry('a-2')], label: 'Today' }]

const base = { groups: [], isError: false, isPending: false }

describe('<ActivityTimeline/>', () => {
  it('Should show skeletons while pending', async () => {
    await render(<ActivityTimeline {...base} isPending />)
    expect(screen.getByTestId('activity-timeline-loading')).toBeTruthy()
  })
  it('Should show the error state', async () => {
    await render(<ActivityTimeline {...base} isError />)
    expect(screen.getByTestId('activity-timeline-error')).toBeTruthy()
  })
  it('Should show the empty state', async () => {
    await render(<ActivityTimeline {...base} />)
    expect(screen.getByTestId('activity-timeline-empty')).toBeTruthy()
  })
  it('Should render each group label and entry', async () => {
    await render(<ActivityTimeline {...base} groups={GROUPS} />)
    expect(screen.getByText('Today')).toBeTruthy()
    expect(screen.getByTestId('activity-entry-a-1')).toBeTruthy()
    expect(screen.getByTestId('activity-entry-a-2')).toBeTruthy()
  })
  it('Should select an entry when tapped', async () => {
    const onSelect = jest.fn()
    await render(
      <ActivityTimeline {...base} groups={GROUPS} onSelect={onSelect} />
    )
    await fireEvent.press(screen.getByTestId('activity-entry-a-1'))
    expect(onSelect).toHaveBeenCalledWith(GROUPS[0].entries[0])
  })
  it('Should render non-pressable rows without onSelect', async () => {
    await render(<ActivityTimeline {...base} groups={GROUPS} />)
    expect(screen.getByTestId('activity-entry-a-1')).toBeTruthy()
  })
})
