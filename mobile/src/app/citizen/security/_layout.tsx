import { Stack } from 'expo-router'

// A deep link straight to an alert still gets the overview underneath, so back lands somewhere sensible
export const unstable_settings = { initialRouteName: 'index' }

export default function SecurityLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
