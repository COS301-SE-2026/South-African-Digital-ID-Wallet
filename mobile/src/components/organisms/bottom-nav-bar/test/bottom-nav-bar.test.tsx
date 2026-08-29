import { fireEvent, render, screen } from '@testing-library/react-native'
import type { BottomTabBarProps } from 'expo-router/tabs'

import { citizenTabs } from '@/config/navigation'

import { BottomNavBar } from '../bottom-nav-bar'

const makeProps = (index = 0, defaultPrevented = false) => ({
  descriptors: {},
  insets: { bottom: 20, left: 0, right: 0, top: 0 },
  navigation: {
    emit: jest.fn(() => ({ defaultPrevented })),
    navigate: jest.fn(),
  },
  state: {
    index,
    routes: citizenTabs.map((tab) => ({
      key: `${tab.name}-key`,
      name: tab.name,
      params: undefined,
    })),
  },
})

const renderBar = (props: ReturnType<typeof makeProps>) =>
  render(
    <BottomNavBar
      {...(props as unknown as BottomTabBarProps)}
      tabs={citizenTabs}
    />
  )

describe('<BottomNavBar/>', () => {
  it('Should render a tab per configures route', async () => {
    await renderBar(makeProps())
    citizenTabs.forEach((tab) =>
      expect(screen.getByTestId(`nav-tab-${tab.name}`)).toBeTruthy()
    )
    expect(screen.getByText('Present')).toBeTruthy()
  })
  it('Should mark only the active route as selected', async () => {
    await renderBar(makeProps(1))
    expect(
      screen.getByTestId('nav-tab-wallet').props.accessibilityState.selected
    ).toBe(true)
    expect(
      screen.getByTestId('nav-tab-home').props.accessibilityState.selected
    ).toBe(false)
  })
  it('Should skip routes with no matching tab config', async () => {
    const props = makeProps()
    props.state.routes.push({
      key: 'ghost-key',
      name: 'ghost',
      params: undefined,
    })
    await renderBar(props)
    expect(screen.queryByTestId('nav-tab-ghost')).toBeNull()
  })
  it('Should emit tabPress and navigate to an unfocused tab', async () => {
    const props = makeProps()
    await renderBar(props)
    await fireEvent.press(screen.getByTestId('nav-tab-profile'))
    expect(props.navigation.emit).toHaveBeenCalledWith({
      canPreventDefault: true,
      target: 'profile-key',
      type: 'tabPress',
    })
    expect(props.navigation.navigate).toHaveBeenCalledWith('profile', undefined)
  })
  it('Should not re-navigate to the focused tab', async () => {
    const props = makeProps()
    await renderBar(props)
    await fireEvent.press(screen.getByTestId('nav-tab-home'))
    expect(props.navigation.navigate).not.toHaveBeenCalled()
  })
  it('Should respect a prevented tabPress', async () => {
    const props = makeProps(0, true)
    await renderBar(props)
    await fireEvent.press(screen.getByTestId('nav-tab-wallet'))
    expect(props.navigation.navigate).not.toHaveBeenCalled()
  })
})
