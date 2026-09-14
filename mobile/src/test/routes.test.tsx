import { render } from '@testing-library/react-native'

import { useAuthStore } from '@/stores/auth-store'

const mockRedirect = jest.fn((_props: { href: string }) => null)

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => mockRedirect(props),
  Stack: Object.assign(() => null, { Screen: () => null }),
  useLocalSearchParams: () => ({ credentialId: 'c-1', id: 'c-1' }),
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}))
jest.mock('expo-screen-capture', () => ({ usePreventScreenCapture: jest.fn() }))
jest.mock('@/components/pages', () => {
  const names = [
    'ActivityPage',
    'AuditLogPage',
    'CitizenHomePage',
    'CitizenWalletPage',
    'CredentialDetailPage',
    'LoginPage',
    'OfficialHomePage',
    'ProfilePage',
    'QrGenerationPage',
    'QrScannerPage',
    'RegisterPage',
  ]
  return Object.fromEntries(names.map((n) => [n, () => null]))
})
jest.mock('@/components/templates', () => ({
  BiometricGate: () => null,
  DetailScreen: () => null,
}))

const initial = useAuthStore.getState()

describe('app routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initial, true)
  })

  it('Should redirect an anonymous visitor to login', async () => {
    const Index = require('@/app/index').default
    await render(<Index />)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/login' })
    )
  })

  it('Should redirect a citizen to the citizen home', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { userId: 'u-1', role: 'citizen', names: 'T', surname: 'M' },
    } as never)
    const Index = require('@/app/index').default
    await render(<Index />)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/citizen/home' })
    )
  })

  it('Should send an unknown role to the unsupported-role screen', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { userId: 'u-1', role: 'wizard', names: 'T', surname: 'M' },
    } as never)
    const Index = require('@/app/index').default
    await render(<Index />)
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: '/unsupported-role' })
    )
  })

  it.each([
    'citizen/home',
    'citizen/activity',
    'citizen/profile',
    'citizen/present',
    'official/home',
    'official/history',
    'official/audit-log',
    'official/profile',
    '(auth)/login',
    '(auth)/register',
    'citizen/wallet/index',
    'citizen/wallet/[id]',
    'unsupported-role',
  ])('Should mount the %s route without crashing', async (route) => {
    const Screen = require(`@/app/${route}`).default
    expect(await render(<Screen />)).toBeTruthy()
  })
})
