// START FLASHID — PROFILE AVATAR PHOTO
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { credentialService } from '@/services/credential-service'
// END FLASHID — PROFILE AVATAR PHOTO
import { render, screen } from '@testing-library/react'
// START FLASHID — PROFILE AVATAR PHOTO
import { usePathname } from 'next/navigation'
// END FLASHID — PROFILE AVATAR PHOTO
import { AppShell } from '../app-shell'
import { useUser } from '@/context/user-context'

// START FLASHID — PROFILE AVATAR PHOTO
jest.mock('@/services/credential-service', () => ({
  credentialService: { getMine: jest.fn() },
}))
// END FLASHID — PROFILE AVATAR PHOTO

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/officials'),
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}))

jest.mock('@/context/user-context', () => ({
  useUser: jest.fn(),
}))

const mockedUseUser = useUser as jest.Mock
// START FLASHID — PROFILE AVATAR PHOTO
const mockedUsePathname = usePathname as jest.Mock
const mockedGetMine = jest.mocked(credentialService.getMine)
const renderWithQueryClient = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    ),
  }
}
// END FLASHID — PROFILE AVATAR PHOTO

describe('AppShell', () => {
  beforeEach(() => {
    // START FLASHID — PROFILE AVATAR PHOTO
    mockedGetMine.mockReset()
    mockedUsePathname.mockReturnValue('/officials')
    // END FLASHID — PROFILE AVATAR PHOTO
    mockedUseUser.mockReturnValue({
      user: {
        role: 'Official',
        names: 'Test',
        surname: 'User',
        email: 'test@example.com',
        userId: '12345678',
      },
      loading: false,
      logout: jest.fn(),
    })
  })

  it('renders the correct page header for the current pathname', () => {
    renderWithQueryClient(
      <AppShell>
        <div>content</div>
      </AppShell>
    )

    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('renders children', () => {
    renderWithQueryClient(
      <AppShell>
        <div>page content</div>
      </AppShell>
    )

    expect(screen.getByText('page content')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      loading: true,
      logout: jest.fn(),
    })

    renderWithQueryClient(
      <AppShell>
        <div>content</div>
      </AppShell>
    )

    expect(screen.getByText('Load')).toBeInTheDocument()
  })

  it('renders nothing when there is no user', () => {
    mockedUseUser.mockReturnValue({
      user: null,
      loading: false,
      logout: jest.fn(),
    })

    const { container } = renderWithQueryClient(
      <AppShell>
        <div>content</div>
      </AppShell>
    )

    expect(container.firstChild).toBeNull()
  })

  // START FLASHID — PROFILE AVATAR PHOTO
  it('loads the citizen photo once and shares it with the header and sidebars', async () => {
    mockedUsePathname.mockReturnValue('/citizen/citizen-dashboard')
    mockedUseUser.mockReturnValue({
      user: {
        role: 'Citizen',
        names: 'Kabelo',
        surname: 'Pillay',
        email: 'kp@example.com',
        userId: 'citizen-1',
      },
      loading: false,
      logout: jest.fn(),
    })
    mockedGetMine.mockResolvedValue([
      {
        id: 'license-1',
        type: 'DriversLicense',
        photoUrl: 'https://photos.example/license.jpg',
      },
      {
        id: 'identity-1',
        type: 'IdentityDocument',
        photoUrl: 'https://photos.example/identity.jpg',
      },
    ] as Awaited<ReturnType<typeof credentialService.getMine>>)

    const { queryClient, container } = renderWithQueryClient(
      <AppShell>
        <div>citizen dashboard</div>
      </AppShell>
    )

    await waitFor(() => {
      expect(
        container.querySelectorAll(
          'img[src="https://photos.example/identity.jpg"]'
        )
      ).toHaveLength(2)
    })
    expect(mockedGetMine).toHaveBeenCalledTimes(1)
    expect(
      queryClient.getQueryData(['credentials', 'me', 'citizen-1'])
    ).toBeDefined()
  })

  it('uses the drivers licence photo when no identity document photo exists', async () => {
    mockedUsePathname.mockReturnValue('/citizen/citizen-dashboard')
    mockedUseUser.mockReturnValue({
      user: {
        role: 'Citizen',
        names: 'Kabelo',
        surname: 'Pillay',
        email: 'kp@example.com',
        userId: 'citizen-2',
      },
      loading: false,
      logout: jest.fn(),
    })
    mockedGetMine.mockResolvedValue([
      {
        id: 'license-1',
        type: 'DriversLicense',
        photoUrl: 'https://photos.example/license.jpg',
      },
    ] as Awaited<ReturnType<typeof credentialService.getMine>>)

    const { container } = renderWithQueryClient(
      <AppShell>
        <div>citizen dashboard</div>
      </AppShell>
    )

    await waitFor(() => {
      expect(
        container.querySelectorAll(
          'img[src="https://photos.example/license.jpg"]'
        )
      ).toHaveLength(2)
    })
  })

  it('does not request or pass citizen photos for other roles', () => {
    const { container } = renderWithQueryClient(
      <AppShell>
        <div>official dashboard</div>
      </AppShell>
    )

    expect(mockedGetMine).not.toHaveBeenCalled()
    expect(container.querySelector('img[src*="photos.example"]')).toBeNull()
  })
  // END FLASHID — PROFILE AVATAR PHOTO
})
