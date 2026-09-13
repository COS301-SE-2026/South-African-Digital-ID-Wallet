import { screen } from '@testing-library/react-native'
import { Text as RNText } from 'react-native'

import { renderWithSafeArea } from '@/test/utils/render-with-providers'

import { WalletScreen } from '../wallet-screen'

describe('<WalletScreen/>', () => {
  it('Should render the title and children', async () => {
    await renderWithSafeArea(
      <WalletScreen title="My Wallet">
        <RNText>body</RNText>
      </WalletScreen>
    )
    expect(screen.getByText('My Wallet')).toBeTruthy()
    expect(screen.getByText('body')).toBeTruthy()
  })
  it('Should render an optional subtitle', async () => {
    await renderWithSafeArea(
      <WalletScreen subtitle="2 credentials" title="My Wallet">
        <RNText>body</RNText>
      </WalletScreen>
    )
    expect(screen.getByText('2 credentials')).toBeTruthy()
  })
  it('Should omit the subtitle when not given', async () => {
    await renderWithSafeArea(
      <WalletScreen title="My Wallet">
        <RNText>body</RNText>
      </WalletScreen>
    )
    expect(screen.queryByText('2 credentials')).toBeNull()
  })
  it('Should render a header action', async () => {
    await renderWithSafeArea(
      <WalletScreen action={<RNText>action</RNText>} title="My Wallet">
        <RNText>body</RNText>
      </WalletScreen>
    )
    expect(screen.getByText('action')).toBeTruthy()
  })
})
