import { render, screen } from '@testing-library/react-native'

import { Skeleton } from '../skeleton'

describe('<Skeleton/>', () => {
  it('Should render as a progress placeholder', async () => {
    await render(<Skeleton testID="skeleton" />)
    expect(screen.getByTestId('skeleton').props.accessibilityRole).toBe(
      'progressbar'
    )
  })
  it('Should apply an explicit style', async () => {
    await render(<Skeleton style={{ height: 150 }} testID="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveStyle({ height: 150 })
  })
})
