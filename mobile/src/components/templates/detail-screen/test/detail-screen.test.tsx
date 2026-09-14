import { fireEvent, screen } from '@testing-library/react-native'
import { Text as RNText } from 'react-native'

import { renderWithSafeArea } from '@/test/utils/render-with-providers'

import { DetailScreen } from '../detail-screen'

describe('<DetailScreen/>', () => {
  it('Should render its title and children', async () => {
    await renderWithSafeArea(
      <DetailScreen onBack={jest.fn()} title="Share Identity">
        <RNText>body</RNText>
      </DetailScreen>
    )
    expect(screen.getByText('Share Identity')).toBeTruthy()
    expect(screen.getByText('body')).toBeTruthy()
  })
  it('Should call onBack from the header button', async () => {
    const onBack = jest.fn()
    await renderWithSafeArea(
      <DetailScreen onBack={onBack} title="T">
        <RNText>body</RNText>
      </DetailScreen>
    )
    await fireEvent.press(screen.getByTestId('detail-back-button'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
  it('Should render an action footer when given one', async () => {
    await renderWithSafeArea(
      <DetailScreen
        action={<RNText>footer</RNText>}
        onBack={jest.fn()}
        title="T"
      >
        <RNText>body</RNText>
      </DetailScreen>
    )
    expect(screen.getByText('footer')).toBeTruthy()
  })
  it('Should omit the footer when no action is given', async () => {
    await renderWithSafeArea(
      <DetailScreen onBack={jest.fn()} title="T">
        <RNText>body</RNText>
      </DetailScreen>
    )
    expect(screen.queryByText('footer')).toBeNull()
  })
})
