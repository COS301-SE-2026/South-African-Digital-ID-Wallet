import { act, fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'

import {
  CREDENTIAL_LIST_CARD_HEIGHT,
  CredentialList,
} from '@/components/organisms'
import api from '@/lib/api'
import type { WalletCredential } from '@/services'
import { useCredentialUnlockStore } from '@/stores/credential-unlock-store'
import { renderWithProviders } from '@/test/utils/render-with-providers'

import { CitizenWalletPage } from '../citizen-wallet-page'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn(),
  loadSession: jest.fn(),
  saveSession: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/pdf-file', () => ({
  deletePdf: jest.fn(),
  openPdf: jest.fn(),
  savePdf: jest.fn(),
}))
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock('@/components/organisms', () => {
  const actual = jest.requireActual('@/components/organisms')
  return {
    ...actual,
    CredentialList: jest.fn((props) => actual.CredentialList(props)),
  }
})
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
}))

const getMock = api.get as jest.Mock
const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock
const push = jest.fn()

type ListProps = {
  credentials: WalletCredential[]
  onSelect: (credential: WalletCredential) => Promise<void>
}

const latestListProps = () =>
  (CredentialList as unknown as jest.Mock).mock.calls.at(-1)[0] as ListProps

const settle = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))

const CREDENTIALS = [
  {
    id: 'id-1',
    issuedBy: 'Department of Home Affairs',
    issueDate: '2026-02-02T00:00:00Z',
    status: 'Active',
    title: 'National ID Card',
    type: 'IdentityDocument',
  },
  {
    id: 'dl-1',
    issuedBy: 'Department of Transport',
    issueDate: '2026-03-03T00:00:00Z',
    status: 'Active',
    title: "Driver's Licence",
    type: 'DriversLicense',
  },
]

describe('<CitizenWalletPage/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCredentialUnlockStore.getState().clear()
    ;(useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push })
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
    getMock.mockResolvedValue({ data: CREDENTIALS })
  })

  it('Should show skeleton cards while loading', async () => {
    getMock.mockReturnValue(new Promise(() => undefined))
    await renderWithProviders(<CitizenWalletPage />)
    expect(screen.getByTestId('wallet-loading')).toBeTruthy()
  })

  it('Should size the skeletons like the credential cards', async () => {
    getMock.mockReturnValue(new Promise(() => undefined))
    await renderWithProviders(<CitizenWalletPage />)
    const skeletons = screen.getAllByTestId('wallet-skeleton')
    expect(skeletons).toHaveLength(2)
    for (const skeleton of skeletons) {
      expect(skeleton).toHaveStyle({ height: CREDENTIAL_LIST_CARD_HEIGHT })
    }
  })

  it('Should show an error when the credentials fail to load', async () => {
    getMock.mockRejectedValue(new Error('boom'))
    await renderWithProviders(<CitizenWalletPage />)
    expect(await screen.findByTestId('wallet-error')).toBeTruthy()
  })

  it('Should explain an empty wallet', async () => {
    getMock.mockResolvedValue({ data: [] })
    await renderWithProviders(<CitizenWalletPage />)
    expect(await screen.findByTestId('wallet-empty')).toBeTruthy()
  })

  it('Should list the ID and licence as two simple cards', async () => {
    await renderWithProviders(<CitizenWalletPage />)
    expect(await screen.findByText('National ID Card')).toBeTruthy()
    expect(screen.getByText("Driver's Licence")).toBeTruthy()
    expect(screen.getByTestId('credential-list')).toBeTruthy()
    expect(screen.queryByTestId('credential-deck')).toBeNull()
  })

  it('Should ask for biometrics and open the credential once unlocked', async () => {
    authenticate.mockResolvedValue({ success: true })
    await renderWithProviders(<CitizenWalletPage />)
    await fireEvent.press(await screen.findByTestId('credential-card-dl-1'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        params: { id: 'dl-1' },
        pathname: '/citizen/wallet/[id]',
      })
    )
    expect(authenticate).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: "Unlock Driver's Licence" })
    )
    expect(useCredentialUnlockStore.getState().unlockedId).toBe('dl-1')
  })

  it('Should stay on the wallet when the biometric check is cancelled', async () => {
    authenticate.mockResolvedValue({ error: 'user_cancel', success: false })
    await renderWithProviders(<CitizenWalletPage />)
    await fireEvent.press(await screen.findByTestId('credential-card-id-1'))
    await waitFor(() => expect(authenticate).toHaveBeenCalled())
    expect(push).not.toHaveBeenCalled()
    expect(useCredentialUnlockStore.getState().unlockedId).toBeNull()
  })

  it('Should ask the user to set up a device lock when none exists', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn())
    isEnrolled.mockResolvedValue(false)
    await renderWithProviders(<CitizenWalletPage />)
    await fireEvent.press(await screen.findByTestId('credential-card-id-1'))
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Device lock required',
        expect.any(String)
      )
    )
    expect(authenticate).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    alert.mockRestore()
  })

  it('Should ignore a second tap made before the first prompt re-renders', async () => {
    let resolvePrompt: (value: { success: boolean }) => void = () => undefined
    authenticate.mockReturnValue(
      new Promise((resolve) => {
        resolvePrompt = resolve
      })
    )
    await renderWithProviders(<CitizenWalletPage />)
    await screen.findByTestId('credential-card-id-1')
    const { credentials, onSelect } = latestListProps()
    let taps: Promise<void>[] = []
    await act(async () => {
      taps = [onSelect(credentials[0]), onSelect(credentials[1])]
    })
    await waitFor(() => expect(authenticate).toHaveBeenCalledTimes(1))
    await act(async () => {
      resolvePrompt({ success: true })
      await Promise.all(taps)
    })
    expect(hasHardware).toHaveBeenCalledTimes(1)
    expect(authenticate).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith({
      params: { id: 'id-1' },
      pathname: '/citizen/wallet/[id]',
    })
  })

  it('Should allow another tap once a cancelled prompt has finished', async () => {
    authenticate
      .mockResolvedValueOnce({ error: 'user_cancel', success: false })
      .mockResolvedValueOnce({ success: true })
    await renderWithProviders(<CitizenWalletPage />)
    await fireEvent.press(await screen.findByTestId('credential-card-id-1'))
    await waitFor(() => expect(authenticate).toHaveBeenCalledTimes(1))
    await settle()
    await fireEvent.press(screen.getByTestId('credential-card-dl-1'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        params: { id: 'dl-1' },
        pathname: '/citizen/wallet/[id]',
      })
    )
    expect(authenticate).toHaveBeenCalledTimes(2)
  })

  it('Should allow another tap after the device lock alert', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn())
    isEnrolled.mockResolvedValue(false)
    await renderWithProviders(<CitizenWalletPage />)
    await fireEvent.press(await screen.findByTestId('credential-card-id-1'))
    await waitFor(() => expect(alert).toHaveBeenCalledTimes(1))
    await settle()
    await fireEvent.press(screen.getByTestId('credential-card-id-1'))
    await waitFor(() => expect(alert).toHaveBeenCalledTimes(2))
    alert.mockRestore()
  })
})
