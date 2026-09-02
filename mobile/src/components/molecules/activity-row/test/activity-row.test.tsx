import { render, screen } from '@testing-library/react-native'
import { LogIn } from 'lucide-react-native'

import { ActivityRow } from '../activity-row'

const ROW_TITLE = 'Logged in'
const ROW_DESC = 'Mobile App'
const ROW_TIME = 'Today, 09:30'

describe('<ActivityRow/>', () => {
  it('Should render title, description and timestamp', async () => {
    const activityData = {
      description: ROW_DESC,
      Icon: LogIn,
      timestamp: ROW_TIME,
      title: ROW_TITLE,
    }
    await render(<ActivityRow {...activityData} />)
    const titleElement = screen.getByText(ROW_TITLE)
    const descElement = screen.getByText(ROW_DESC)
    const timeElement = screen.getByText(ROW_TIME)
    expect(titleElement).toBeTruthy()
    expect(descElement).toBeTruthy()
    expect(timeElement).toBeTruthy()
  })
  it('Should omit the description line when none is given', async () => {
    const activityData = {
      Icon: LogIn,
      timestamp: ROW_TIME,
      title: ROW_TITLE,
    }
    await render(<ActivityRow {...activityData} />)
    const missingDesc = screen.queryByText(ROW_DESC)
    expect(missingDesc).toBeNull()
  })
})
