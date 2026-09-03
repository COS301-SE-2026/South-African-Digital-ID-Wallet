import { fireEvent, render, screen } from '@testing-library/react-native'

import { SectionHeader } from '../section-header'

const SECTION_TITLE = 'Recent Activity'
const ACTION_LABEL = 'View all'

describe('<SectionHeader/>', () => {
  it('Should render the title only when no action is supplied', async () => {
    const headerConfig = { title: SECTION_TITLE }
    await render(<SectionHeader {...headerConfig} />)
    const titleElement = screen.getByText(SECTION_TITLE)
    const actionElement = screen.queryByText(ACTION_LABEL)
    expect(titleElement).toBeTruthy()
    expect(actionElement).toBeNull()
  })
  it('Should fire the action handler', async () => {
    const actionCallback = jest.fn()
    const headerConfig = {
      actionLabel: ACTION_LABEL,
      onActionPress: actionCallback,
      title: SECTION_TITLE,
    }
    await render(<SectionHeader {...headerConfig} />)
    const actionButton = screen.getByText(ACTION_LABEL)
    await fireEvent.press(actionButton)
    expect(actionCallback).toHaveBeenCalledTimes(1)
  })
})
