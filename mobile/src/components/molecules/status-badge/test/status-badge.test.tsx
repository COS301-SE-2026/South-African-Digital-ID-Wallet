import { render, screen } from '@testing-library/react-native'

import { StatusBadge } from '@/components/molecules/status-badge'

describe('<StatusBadge/>', () => {
  it('Should render its label', async () => {
    await render(<StatusBadge label="High" tone="danger" testID="badge" />)
    expect(screen.getByText('High')).toBeTruthy()
    expect(screen.getByTestId('badge')).toBeTruthy()
  })

  it('Should render with the neutral tone by default', async () => {
    await render(<StatusBadge label="Unknown" />)
    expect(screen.getByText('Unknown')).toBeTruthy()
  })
})
