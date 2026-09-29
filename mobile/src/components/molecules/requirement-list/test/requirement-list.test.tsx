import { render, screen } from '@testing-library/react-native'

import { RequirementList } from '../requirement-list'

describe('<RequirementList/>', () => {
  it('Should render nothing once every rule is met', async () => {
    await render(
      <RequirementList
        items={[
          { label: 'A', met: true },
          { label: 'B', met: true },
        ]}
        testID="rules"
      />
    )
    expect(screen.queryByTestId('rules')).toBeNull()
  })
  it('Should list every rule while any is unmet', async () => {
    await render(
      <RequirementList
        items={[
          { label: 'A', met: true },
          { label: 'B', met: false },
        ]}
        testID="rules"
      />
    )
    expect(screen.getByTestId('rules')).toBeTruthy()
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
  })
  it('Should render nothing for an empty list', async () => {
    await render(<RequirementList items={[]} testID="rules" />)
    expect(screen.queryByTestId('rules')).toBeNull()
  })
})
