import type { BottomTabBarProps } from 'expo-router/tabs'

import type { NavTabConfig } from '@/components/molecules'

export type BottomNavBarProps = BottomTabBarProps & { tabs: NavTabConfig[] }
