import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'

import api from '@/lib/api'
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
jest.mock('@/lib/pdf-file', () => ({ openPdf: jest.fn(), savePdf: jest.fn() }))
jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
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

  it('Should ignore a second tap while the biometric prompt is open', async () => {
    let resolvePrompt: (value: { success: boolean }) => void = () => undefined
    authenticate.mockReturnValue(
      new Promise((resolve) => {
        resolvePrompt = resolve
      })
    )
    await renderWithProviders(<CitizenWalletPage />)
    const firstCard = await screen.findByTestId('credential-card-id-1')
    const secondCard = screen.getByTestId('credential-card-dl-1')
    const firstPress = fireEvent.press(firstCard)
    await waitFor(() => expect(authenticate).toHaveBeenCalledTimes(1))
    const secondPress = fireEvent.press(secondCard)
    resolvePrompt({ success: true })
    await Promise.all([firstPress, secondPress])
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1))
    expect(authenticate).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith({
      params: { id: 'id-1' },
      pathname: '/citizen/wallet/[id]',
    })
  })
})
