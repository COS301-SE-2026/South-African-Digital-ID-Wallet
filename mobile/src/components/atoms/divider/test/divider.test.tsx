import { render, screen } from '@testing-library/react-native'

import { Divider } from '../divider'

describe('<Divider/>', () => {
  it('Should render a plain rule with no label', async () => {
    await render(<Divider />)
    expect(screen.queryByText('OR')).toBeNull()
  })
  it('Should render the label between two rules', async () => {
    await render(<Divider label="OR" />)
    expect(screen.getByText('OR')).toBeTruthy()
  })
})
