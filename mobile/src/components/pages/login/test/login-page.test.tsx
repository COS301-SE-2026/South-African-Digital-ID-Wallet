import { render, screen } from '@testing-library/react-native'

import { LoginPage } from '../login-page'

jest.mock('@/components/organisms', () => ({
  LoginForm: () =>
    require('react').createElement(
      require('react-native').Text,
      null,
      'login-form'
    ),
}))

it('Should frame the login form in the auth screen', async () => {
  await render(<LoginPage />)
  expect(screen.getByText('Welcome back')).toBeTruthy()
  expect(screen.getByText('login-form')).toBeTruthy()
})
