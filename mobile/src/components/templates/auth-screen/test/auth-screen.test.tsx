import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { AuthScreen } from '../auth-screen'

it('Should lay out title, subtitle and children', async () => {
  await render(
    <AuthScreen subtitle="Sub" title="Title">
      <Text>child</Text>
    </AuthScreen>
  )
  expect(screen.getByText('Title')).toBeTruthy()
  expect(screen.getByText('Sub')).toBeTruthy()
  expect(screen.getByText('child')).toBeTruthy()
})
