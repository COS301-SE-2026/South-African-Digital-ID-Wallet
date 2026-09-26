import { AxiosError, type AxiosResponse } from 'axios'
import { fireEvent, screen, waitFor } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'

import api from '@/lib/api'
import { openPdf, savePdf } from '@/lib/pdf-file'
import { useAuthStore } from '@/stores/auth-store'
import { useCredentialUnlockStore } from '@/stores/credential-unlock-store'
import { renderWithProviders } from '@/test/utils/render-with-providers'

import { CredentialDetailPage } from '../credential-detail-page'

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
const postMock = api.post as jest.Mock
const saveMock = savePdf as jest.Mock
const openMock = openPdf as jest.Mock
const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock
const back = jest.fn()
const push = jest.fn()
const initialAuthState = useAuthStore.getState()

const PDF_BYTES = [37, 80, 68, 70]
const FILE = { uri: 'file:///cache/licence.pdf' }

const LICENCE = {
  driversLicense: {
    expiryDate: '2030-01-01T00:00:00Z',
    licenseCode: 'B',
    licenseNumber: 'DL-123',
    restrictions: '',
  },
  id: 'dl-1',
  issuedBy: 'Department of Transport',
  issueDate: '2026-03-03T00:00:00Z',
  status: 'Active',
  title: "Driver's Licence",
  type: 'DriversLicense',
}

const axiosErrorWith = (status: number) =>
  new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: {},
    status,
  } as AxiosResponse)

const renderUnlocked = async (credential = LICENCE) => {
  getMock.mockResolvedValue({ data: [credential] })
  useCredentialUnlockStore.getState().unlock(credential.id)
  await renderWithProviders(<CredentialDetailPage id={credential.id} />)
  await screen.findByTestId('credential-detail-card')
}

describe('<CredentialDetailPage/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCredentialUnlockStore.getState().clear()
    useAuthStore.setState(
      {
        ...initialAuthState,
        user: { names: 'Thabo', role: 'citizen', surname: 'Mokoena' },
      } as never,
      true
    )
    ;(useRouter as jest.Mock).mockReturnValue({ back, push })
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
    saveMock.mockReturnValue(FILE)
    openMock.mockResolvedValue(undefined)
    postMock.mockResolvedValue({
      data: new Uint8Array(PDF_BYTES).buffer,
      headers: { 'content-disposition': 'attachment; filename=licence.pdf' },
    })
  })

  afterAll(() => useAuthStore.setState(initialAuthState, true))

  it('Should show the credential once it has been unlocked', async () => {
    await renderUnlocked()
    expect(screen.getByText('Thabo Mokoena')).toBeTruthy()
    expect(screen.getByText('DL-123')).toBeTruthy()
    expect(authenticate).not.toHaveBeenCalled()
  })

  it('Should place the certified copy button below share identity', async () => {
    await renderUnlocked()
    const buttons = screen
      .getAllByRole('button')
      .map((button) => button.props.testID)
    expect(buttons.indexOf('certified-copy-button')).toBeGreaterThan(
      buttons.indexOf('share-identity-button')
    )
    expect(screen.getByText('Generate Certified Copy')).toBeTruthy()
  })

  it('Should open the QR share flow from share identity', async () => {
    await renderUnlocked()
    await fireEvent.press(screen.getByTestId('share-identity-button'))
    expect(push).toHaveBeenCalledWith({
      params: { credentialId: 'dl-1' },
      pathname: '/citizen/present',
    })
  })

  it('Should download and open the certified copy pdf', async () => {
    await renderUnlocked()
    await fireEvent.press(screen.getByTestId('certified-copy-button'))
    await waitFor(() => expect(openMock).toHaveBeenCalledWith(FILE))
    expect(postMock).toHaveBeenCalledWith(
      '/api/certified-copies/credentials/dl-1',
      undefined,
      expect.objectContaining({ responseType: 'arraybuffer' })
    )
    const [bytes, fileName] = saveMock.mock.calls[0]
    expect(Array.from(bytes as Uint8Array)).toEqual(PDF_BYTES)
    expect(fileName).toBe('licence.pdf')
  })

  it('Should show a spinner while the certified copy is generating', async () => {
    postMock.mockReturnValue(new Promise(() => undefined))
    await renderUnlocked()
    await fireEvent.press(screen.getByTestId('certified-copy-button'))
    await waitFor(() =>
      expect(
        screen.getByTestId('certified-copy-button').props.accessibilityState
      ).toEqual({ busy: true, disabled: true })
    )
    expect(screen.queryByText('Generate Certified Copy')).toBeNull()
  })

  it('Should alert the user when the certified copy fails', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn())
    postMock.mockRejectedValue(axiosErrorWith(400))
    await renderUnlocked()
    await fireEvent.press(screen.getByTestId('certified-copy-button'))
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Certified copy failed',
        'This credential is not active, so a certified copy cannot be issued.'
      )
    )
    expect(openMock).not.toHaveBeenCalled()
    alert.mockRestore()
  })

  it('Should disable the certified copy for an inactive credential', async () => {
    await renderUnlocked({ ...LICENCE, status: 'Revoked' })
    expect(
      screen.getByTestId('certified-copy-button').props.accessibilityState
        .disabled
    ).toBe(true)
    await fireEvent.press(screen.getByTestId('certified-copy-button'))
    expect(postMock).not.toHaveBeenCalled()
  })

  it('Should ask for biometrics when opened without a recent unlock', async () => {
    authenticate.mockResolvedValue({ success: true })
    getMock.mockResolvedValue({ data: [LICENCE] })
    await renderWithProviders(<CredentialDetailPage id="dl-1" />)
    expect(screen.getByTestId('credential-detail-loading')).toBeTruthy()
    expect(await screen.findByTestId('credential-detail-card')).toBeTruthy()
    expect(authenticate).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: "Unlock Driver's Licence" })
    )
  })

  it('Should go back when the biometric check is cancelled', async () => {
    authenticate.mockResolvedValue({ error: 'user_cancel', success: false })
    getMock.mockResolvedValue({ data: [LICENCE] })
    await renderWithProviders(<CredentialDetailPage id="dl-1" />)
    await waitFor(() => expect(back).toHaveBeenCalled())
    expect(screen.queryByTestId('credential-detail-card')).toBeNull()
  })

  it('Should go back from the header', async () => {
    await renderUnlocked()
    await fireEvent.press(screen.getByTestId('detail-back-button'))
    expect(back).toHaveBeenCalled()
  })
})
