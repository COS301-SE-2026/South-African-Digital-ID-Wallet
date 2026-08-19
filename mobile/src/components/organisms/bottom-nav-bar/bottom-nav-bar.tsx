import { View } from 'react-native'

import { BottomNavBarProps } from './types'
import { NavTabItem } from '@/components/molecules'

export const BottomNavBar = ({
  insets,
  navigation,
  state,
  tabs,
}: BottomNavBarProps) => (
  <View
    className="flex-row items-end border-t border-border-grey bg-clean-white px-2 pt-3"
    style={{ paddingBottom: Math.max(insets.bottom, 8), overflow: 'visible' }}
    testID="bottom-nav-bar"
  >
    {state.routes.map((route, index) => {
      const tab = tabs.find((item) => item.name === route.name)
      if (!tab) {
        return null
      }
      const isFocused = state.index === index
      return (
        <NavTabItem
          key={route.key}
          {...tab}
          isFocused={isFocused}
          testID={`nav-tab-${tab.name}`}
          onPress={() => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params)
            }
          }}
        />
      )
    })}
  </View>
)
