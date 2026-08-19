import { render } from '@testing-library/react-native'
import { Redirect, Tabs } from 'expo-router'

import { useAuthStore } from '@/stores/auth-store'

import CitizenLayout from '../citizen/_layout'
import OfficialLayout from '../official/_layout'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {},
  setAuthToken: jest.fn(),
}))
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
  Tabs: Object.assign(
    jest.fn(() => null),
    { Screen: () => null }
  ),
}))

const redirectMock = Redirect as unknown as jest.Mock
const tabsMock = Tabs as unknown as jest.Mock
const redirectedTo = () => redirectMock.mock.calls[0]?.[0]?.href

const pristine = useAuthStore.getState()

const signInAs = (role: string) =>
  useAuthStore.getState().signIn({
    expiresAt: '2099-01-01T00:00:00Z',
    names: 'Thabo',
    role,
    surname: 'Mokoena',
    token: 'jwt-token',
    userId: 'u-1',
  })

describe.each([
  ['citizen', CitizenLayout, 'official', '/official/home'],
  ['official', OfficialLayout, 'citizen', '/citizen/home'],
] as const)('<%sLayout/>', (own, Layout, other, otherHome) => {
  beforeEach(() => {
    useAuthStore.setState(pristine, true)
    jest.clearAllMocks()
  })

  it('Should bounce anonymous users to login', async () => {
    await render(<Layout />)
    expect(redirectedTo()).toBe('/login')
    expect(tabsMock).not.toHaveBeenCalled()
  })
  it('Should bounce unknown roles to the unsupported screen', async () => {
    signInAs('bank-teller')
    await render(<Layout />)
    expect(redirectedTo()).toBe('/unsupported-role')
  })
  it('Should send the other role to its own home', async () => {
    signInAs(other)
    await render(<Layout />)
    expect(redirectedTo()).toBe(otherHome)
  })
  it('Should tolerate a role with odd casing and separators', async () => {
    signInAs(` ${own.toUpperCase()} `)
    await render(<Layout />)
    expect(tabsMock).toHaveBeenCalled()
  })
  it('Should render the tab shell for its own role', async () => {
    signInAs(own)
    await render(<Layout />)
    expect(tabsMock).toHaveBeenCalled()
    expect(redirectMock).not.toHaveBeenCalled()
  })
})
