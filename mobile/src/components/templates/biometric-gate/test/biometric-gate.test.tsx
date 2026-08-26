import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { Text } from 'react-native'

import { BiometricGate } from '../biometric-gate'

jest.mock('expo-local-authentication', () => ({ authenticateAsync: jest.fn() }))
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) =>
    require('react').useEffect(callback, [callback]),
}))

const authenticate = LocalAuthentication.authenticateAsync as jest.Mock
const Gate = () => (
  <BiometricGate prompt="Confirm identity">
    <Text>protected content</Text>
  </BiometricGate>
)

describe('<BiometricGate/>', () => {
  beforeEach(() => jest.clearAllMocks())
  it('Should reveal children once auth succeeds', async () => {
    authenticate.mockResolvedValue({ success: true })
    await render(<Gate />)
    expect(await screen.findByText('protected content')).toBeTruthy()
    expect(authenticate).toHaveBeenCalledWith({
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      promptMessage: 'Confirm identity',
    })
  })
  it('Should stay locked and offer a retry after a cancel', async () => {
    authenticate.mockResolvedValue({ error: 'user_cancel', success: false })
    await render(<Gate />)
    expect(await screen.findByText('Identity check')).toBeTruthy()
    expect(screen.queryByText('protected content')).toBeNull()
    authenticate.mockResolvedValue({ success: true })
    await fireEvent.press(screen.getByText('Try again'))
    expect(await screen.findByText('protected content')).toBeTruthy()
  })
  it.each(['not_enrolled', 'not_available', 'no_hardware'])(
    'Should explain the missing device lock for %s',
    async (error) => {
      authenticate.mockResolvedValue({ error, success: false })
      await render(<Gate />)
      expect(await screen.findByText('Device lock required')).toBeTruthy()
      expect(screen.queryByText('Try again')).toBeNull()
    }
  )
  it('Should hide children while the check is in flight', async () => {
    authenticate.mockReturnValue(new Promise(() => {}))
    await render(<Gate />)
    expect(screen.queryByText('protected content')).toBeNull()
    await waitFor(() => expect(authenticate).toHaveBeenCalled())
  })
})
