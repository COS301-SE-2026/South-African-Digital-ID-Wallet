import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import api from '@/lib/api'
import { loginService } from '@/services/login-service'
import { UserProvider, useUser } from '@/context/user-context'

const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))
jest.mock('@/services/login-service/login-service', () => ({
  __esModule: true,
  default: { logout: jest.fn() },
}))
const mockedApi = api as unknown as { get: jest.Mock }
const mockedLoginService = loginService as unknown as { logout: jest.Mock }
const STORAGE_KEY = 'flashid-user'
const serverUser = {
  userId: 'u-server',
  email: 'server@example.com',
  role: 'Citizen',
}
const storedUser = {
  userId: 'u-stored',
  email: 'stored@example.com',
  role: 'Citizen',
}

const Probe = () => {
  const { user, loading, logout, refresh, setUser } = useUser()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="email">{user?.email ?? 'none'}</span>
      <span data-testid="names">{user?.names ?? '-'}</span>
      <button onClick={() => void logout()}>logout</button>
      <button onClick={() => void refresh()}>refresh</button>
      <button onClick={() => setUser(null)}>clear</button>
      <button
        onClick={() => setUser((c) => (c ? { ...c, names: 'Updated' } : c))}
      >
        rename
      </button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <UserProvider>
      <Probe />
    </UserProvider>
  )

const settled = async (email: string) =>
  waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent(email))

describe('UserProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('Should load the user from API and presists it', async () => {
    mockedApi.get.mockResolvedValue({ data: serverUser })
    renderProvider()
    await settled('server@example.com')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual(
      serverUser
    )
  })

  it('Should falls back to the stored user when API fails', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedUser))
    mockedApi.get.mockRejectedValue(new Error('network'))
    renderProvider()
    await settled('stored@example.com')
  })

  it('Should end with not user when API fails and no stored', async () => {
    mockedApi.get.mockRejectedValue(new Error('network'))
    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    )
    expect(screen.getByTestId('email')).toHaveTextContent('none')
  })

  it('Should discard the corrupted stored user data', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-json')
    mockedApi.get.mockRejectedValue(new Error('network'))
    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    )
    expect(screen.getByTestId('email')).toHaveTextContent('none')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('supports functional updates through setUser', async () => {
    mockedApi.get.mockResolvedValue({ data: serverUser })
    renderProvider()
    await settled('server@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'rename' }))
    expect(screen.getByTestId('names')).toHaveTextContent('Updated')
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).names).toBe(
      'Updated'
    )
  })

  it('Should remove stored data when user is null', async () => {
    mockedApi.get.mockResolvedValue({ data: serverUser })
    renderProvider()
    await settled('server@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'clear' }))
    expect(screen.getByTestId('email')).toHaveTextContent('none')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('Should clear both storage and redirect home on logout', async () => {
    mockedApi.get.mockResolvedValue({ data: serverUser })
    mockedLoginService.logout.mockResolvedValue(undefined)
    window.sessionStorage.setItem('scratch', 'value')
    renderProvider()
    await settled('server@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'logout' }))
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'))
    expect(screen.getByTestId('email')).toHaveTextContent('none')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(window.sessionStorage.getItem('scratch')).toBeNull()
  })

  it('Should clear the session when logout request fails', async () => {
    mockedApi.get.mockResolvedValue({ data: serverUser })
    mockedLoginService.logout.mockResolvedValue(new Error('offline'))
    renderProvider()
    await settled('server@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'logout' }))
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'))
    expect(screen.getByTestId('email')).toHaveTextContent('none')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('Shoild refetch the user on refresh', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: serverUser })
    renderProvider()
    await settled('server@example.com')
    mockedApi.get.mockResolvedValueOnce({
      data: { ...serverUser, email: 'refreshed@example.com' },
    })
    await userEvent.click(screen.getByRole('button', { name: 'refresh' }))
    await settled('refreshed@example.com')
  })

  it('Should fallback to stored data when refresh fails', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: serverUser })
    renderProvider()
    await settled('server@example.com')
    mockedApi.get.mockRejectedValueOnce(new Error('network'))
    await userEvent.click(screen.getByRole('button', { name: 'refresh' }))
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    )
    expect(screen.getByTestId('email')).toHaveTextContent('server@example.com')
  })

  it('Should provides safe default when used outside a provider', () => {
    render(<Probe />)
    expect(screen.getByTestId('email')).toHaveTextContent('none')
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
  })
})
