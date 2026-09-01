import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'

import { CitizenHomePage } from '@/components/pages'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

import { renderWithProviders } from './utils/render-with-providers'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
  setAuthToken: jest.fn(),
}))
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))

const mockedGet = api.get as jest.Mock
const pushCallback = jest.fn()
const initialAuthState = useAuthStore.getState()

const CRED_ID = 'c-1'
const CRED_ISSUER = 'Department of Home Affairs'
const CRED_ISSUE_DATE = '2026-02-02T00:00:00Z'
const CRED_STATUS_ACTIVE = 'Active'
const CRED_TITLE = 'National ID Card'
const CRED_TYPE = 'IdentityDocument'
const CREDENTIALS = [
  {
    id: CRED_ID,
    issuedBy: CRED_ISSUER,
    issueDate: CRED_ISSUE_DATE,
    status: CRED_STATUS_ACTIVE,
    title: CRED_TITLE,
    type: CRED_TYPE,
  },
]

const ACTIVITY_ID = 'a-1'
const ACTIVITY_TYPE = 'UserLoggedIn'
const ACTIVITY_TITLE = 'Mobile App'
const ACTIVITY = [
  {
    id: ACTIVITY_ID,
    timestamp: new Date().toISOString(),
    title: ACTIVITY_TITLE,
    type: ACTIVITY_TYPE,
  },
]

const GREETING_NAME = 'Thabo'
const GREETING_FULL = 'Hello, Thabo'
const GREETING_NEUTRAL = 'Hello, there'
const SUBTITLE = 'Your digital identity, in your pocket.'
const USER_FIRSTNAME = 'Thabo'
const USER_SURNAME = 'Mokoena'
const USER_FULLNAME = 'Thabo Junior'
const USER_ID = 'u-1'
const JWT_TOKEN = 'jwt-token'
const EXPIRY_DATE = '2099-01-01T00:00:00Z'

const configureApiMock = (credentials: unknown, activity: unknown) =>
  mockedGet.mockImplementation((url: string) =>
    url === '/api/credentials/me'
      ? Promise.resolve({ data: credentials })
      : Promise.resolve({ data: activity })
  )

describe('Citizen home dashboard (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initialAuthState, true)
    ;(useRouter as jest.Mock).mockReturnValue({
      push: pushCallback,
      replace: jest.fn(),
    })
    useAuthStore.getState().signIn({
      expiresAt: EXPIRY_DATE,
      names: USER_FULLNAME,
      role: 'citizen',
      surname: USER_SURNAME,
      token: JWT_TOKEN,
      userId: USER_ID,
    })
  })

  it('Should greet the signed-in citizen by first name', async () => {
    configureApiMock(CREDENTIALS, ACTIVITY)
    await renderWithProviders(<CitizenHomePage />)
    const greeting = screen.getByText(GREETING_FULL)
    const subtitle = screen.getByText(SUBTITLE)
    expect(greeting).toBeTruthy()
    expect(subtitle).toBeTruthy()
  })

  it('Should resolve the identity status from the credentials endpoint', async () => {
    configureApiMock(CREDENTIALS, ACTIVITY)
    await renderWithProviders(<CitizenHomePage />)
    expect(screen.getByTestId('identity-status-loading')).toBeTruthy()
    await waitFor(() => expect(screen.getByText('Verified')).toBeTruthy())
    expect(mockedGet).toHaveBeenCalledWith('/api/credentials/me')
  })

  it('Should surface a pending status when credentials are inactive', async () => {
    const inactiveCredentials = [{ ...CREDENTIALS[0], status: 'Inactive' }]
    configureApiMock(inactiveCredentials, ACTIVITY)
    await renderWithProviders(<CitizenHomePage />)
    await waitFor(() => expect(screen.getByText('Pending')).toBeTruthy())
  })

  it('Should render recent activity mapped from audit events', async () => {
    configureApiMock(CREDENTIALS, ACTIVITY)
    await renderWithProviders(<CitizenHomePage />)
    await waitFor(() => expect(screen.getByText('Logged in')).toBeTruthy())
    const activityDescription = screen.getByText(ACTIVITY_TITLE)
    const activityTimestamp = screen.getByText(/^Today, /)
    expect(activityDescription).toBeTruthy()
    expect(activityTimestamp).toBeTruthy()
  })

  it('Should show the empty state when there is no activity', async () => {
    configureApiMock(CREDENTIALS, [])
    await renderWithProviders(<CitizenHomePage />)
    await waitFor(() =>
      expect(screen.getByTestId('recent-activity-empty')).toBeTruthy()
    )
  })

  it('Should show per-section errors without taking down the screen', async () => {
    mockedGet.mockImplementation((url: string) =>
      url === '/api/credentials/me'
        ? Promise.reject(new Error('offline'))
        : Promise.resolve({ data: ACTIVITY })
    )
    await renderWithProviders(<CitizenHomePage />)
    await waitFor(() =>
      expect(screen.getByTestId('identity-status-error')).toBeTruthy()
    )
    const activity = screen.getByText('Logged in')
    expect(activity).toBeTruthy()
  })

  it('Should navigate to the matching route for each quick action', async () => {
    configureApiMock(CREDENTIALS, ACTIVITY)
    await renderWithProviders(<CitizenHomePage />)
    await fireEvent.press(screen.getByTestId('quick-actions-my-documents'))
    expect(pushCallback).toHaveBeenCalledWith('/citizen/wallet')
    await fireEvent.press(screen.getByTestId('quick-actions-scan-qr'))
    expect(pushCallback).toHaveBeenCalledWith('/citizen/present')
  })

  it('Should navigate to activity from View all', async () => {
    configureApiMock(CREDENTIALS, ACTIVITY)
    await renderWithProviders(<CitizenHomePage />)
    const viewAllButton = screen.getByText('View all')
    await fireEvent.press(viewAllButton)
    expect(pushCallback).toHaveBeenCalledWith('/citizen/activity')
  })

  it('Should fall back to a neutral greeting when no name is stored', async () => {
    configureApiMock(CREDENTIALS, ACTIVITY)
    useAuthStore.setState({ user: null })
    await renderWithProviders(<CitizenHomePage />)
    const neutralGreeting = screen.getByText(GREETING_NEUTRAL)
    expect(neutralGreeting).toBeTruthy()
  })
})
