import { renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { citizenDashboardService } from '@/services/citizen-dashboard-service'

import { useWalletCredential, useWalletCredentials } from '../use-wallet'

jest.mock(
  '@/services/citizen-dashboard-service/citizen-dashboard-service',
  () => ({
    __esModule: true,
    default: {
      getActivity: jest.fn(),
      getCredentials: jest.fn(),
      getOfficialActivity: jest.fn(),
    },
  })
)

const getCredentials = citizenDashboardService.getCredentials as jest.Mock

const CREDENTIALS = [
  {
    id: 'c-1',
    issuedBy: 'Department of Home Affairs',
    issueDate: '2026-02-02T00:00:00Z',
    status: 'Active',
    title: 'National ID Card',
    type: 'IdentityDocument',
  },
]

describe('useWalletCredentials', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should map the fetched credentials', async () => {
    getCredentials.mockResolvedValue(CREDENTIALS)
    const { result } = await renderHook(() => useWalletCredentials(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.credentials).toHaveLength(1))
    expect(result.current.credentials[0].id).toBe('c-1')
  })
  it('Should return an empty list on failure', async () => {
    getCredentials.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useWalletCredentials(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.credentials).toEqual([])
  })
})

describe('useWalletCredential', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should find the credential by id', async () => {
    getCredentials.mockResolvedValue(CREDENTIALS)
    const { result } = await renderHook(() => useWalletCredential('c-1'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.credential).not.toBeNull())
    expect(result.current.credential?.id).toBe('c-1')
  })
  it('Should return null for an unknown id', async () => {
    getCredentials.mockResolvedValue(CREDENTIALS)
    const { result } = await renderHook(() => useWalletCredential('nope'), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.credential).toBeNull()
  })
  it('Should return null when no id is given', async () => {
    getCredentials.mockResolvedValue(CREDENTIALS)
    const { result } = await renderHook(() => useWalletCredential(undefined), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(result.current.credential).toBeNull()
  })
})
