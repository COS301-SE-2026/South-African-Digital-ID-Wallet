import { render, screen } from '@testing-library/react-native'
import { LogIn } from 'lucide-react-native'

import { useRecentActivity } from '@/hooks'

import { RecentActivityList } from '../recent-activity-list'

jest.mock('@/hooks', () => ({ useRecentActivity: jest.fn() }))

const mockHook = useRecentActivity as jest.Mock

const ACTIVITY_TITLE = 'Logged in'
const ACTIVITY_DESC = 'Mobile App'
const ACTIVITY_TIME = 'Today, 09:30'
const ACTIVITIES_DATA = [
  {
    description: ACTIVITY_DESC,
    Icon: LogIn,
    timestamp: ACTIVITY_TIME,
    title: ACTIVITY_TITLE,
    tone: 'soft-green',
  },
]
const LOADING_STATE = {
  isError: false,
  isPending: true,
  entries: [],
}
const ERROR_STATE = {
  isError: true,
  isPending: false,
  entries: [],
}
const EMPTY_STATE = {
  isError: false,
  isPending: false,
  entries: [],
}
const POPULATED_STATE = {
  isError: false,
  isPending: false,
  entries: ACTIVITIES_DATA,
}

describe('<RecentActivityList/>', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should show a skeleton while loading', async () => {
    mockHook.mockReturnValue(LOADING_STATE)
    await render(<RecentActivityList />)
    const skeleton = screen.getByTestId('recent-activity-loading')
    expect(skeleton).toBeTruthy()
  })
  it('Should show an error message when the query fails', async () => {
    mockHook.mockReturnValue(ERROR_STATE)
    await render(<RecentActivityList />)
    const errorMsg = screen.getByTestId('recent-activity-error')
    expect(errorMsg).toBeTruthy()
  })
  it('Should render the empty state when no activities', async () => {
    mockHook.mockReturnValue(EMPTY_STATE)
    await render(<RecentActivityList />)
    const emptyMsg = screen.getByTestId('recent-activity-empty')
    expect(emptyMsg).toBeTruthy()
  })
  it('Should render activity entries when available', async () => {
    mockHook.mockReturnValue(POPULATED_STATE)
    await render(<RecentActivityList />)
    const titleElement = screen.getByText(ACTIVITY_TITLE)
    const descElement = screen.getByText(ACTIVITY_DESC)
    const timeElement = screen.getByText(ACTIVITY_TIME)
    expect(titleElement).toBeTruthy()
    expect(descElement).toBeTruthy()
    expect(timeElement).toBeTruthy()
  })
})
