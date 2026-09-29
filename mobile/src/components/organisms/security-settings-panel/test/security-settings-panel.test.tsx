import { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { SecuritySettingsPanel } from '@/components/organisms/security-settings-panel'
import { useSecuritySettings, useUpdateSecuritySettings } from '@/hooks'
import type { SecuritySettingsResponse } from '@/services/security-service'

jest.mock('@/hooks', () => ({
  useSecuritySettings: jest.fn(),
  useUpdateSecuritySettings: jest.fn(),
}))

const mockedUseSettings = useSecuritySettings as jest.Mock
const mockedUseUpdate = useUpdateSecuritySettings as jest.Mock
const updateSettings = jest.fn()

const SETTINGS: SecuritySettingsResponse = {
  deviceVerificationEnabled: true,
  enhancedVerificationEnabled: false,
  impossibleTravelDetectionEnabled: true,
  qrGenerationRestricted: false,
  qrRestrictedUntil: null,
  trustedDeviceCount: 2,
}

const TRAVEL_SWITCH =
  'security-settings-impossibleTravelDetectionEnabled-switch'
const EXTRA_SWITCH = 'security-settings-enhancedVerificationEnabled-switch'

const showSettings = (settings: SecuritySettingsResponse = SETTINGS) =>
  mockedUseSettings.mockReturnValue({
    isError: false,
    isPending: false,
    settings,
  })

describe('<SecuritySettingsPanel/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    updateSettings.mockResolvedValue(SETTINGS)
    mockedUseUpdate.mockReturnValue({ isUpdating: false, updateSettings })
    showSettings()
  })

  it('Should show placeholders while loading', async () => {
    mockedUseSettings.mockReturnValue({
      isError: false,
      isPending: true,
      settings: null,
    })
    await render(<SecuritySettingsPanel />)
    expect(screen.getByTestId('security-settings-loading')).toBeTruthy()
  })

  it('Should explain when the settings cannot be loaded', async () => {
    mockedUseSettings.mockReturnValue({
      isError: true,
      isPending: false,
      settings: null,
    })
    await render(<SecuritySettingsPanel />)
    expect(
      screen.getByText('We could not load your security settings.')
    ).toBeTruthy()
  })

  it('Should show each protection and the device summary', async () => {
    await render(<SecuritySettingsPanel />)
    expect(screen.getByText('Impossible travel detection')).toBeTruthy()
    expect(screen.getByText('Extra verification')).toBeTruthy()
    expect(screen.getByText('New device verification')).toBeTruthy()
    expect(screen.getByText('2 trusted devices')).toBeTruthy()
    expect(screen.getByText('Available')).toBeTruthy()
    expect(screen.getByTestId(TRAVEL_SWITCH).props.value).toBe(true)
    expect(screen.getByTestId(EXTRA_SWITCH).props.value).toBe(false)
  })

  it('Should show QR sharing as paused while restricted', async () => {
    showSettings({
      ...SETTINGS,
      qrGenerationRestricted: true,
      trustedDeviceCount: 1,
    })
    await render(<SecuritySettingsPanel />)
    expect(screen.getByText('Paused')).toBeTruthy()
    expect(screen.getByText('1 trusted device')).toBeTruthy()
  })

  it('Should turn a protection on without asking for the password', async () => {
    await render(<SecuritySettingsPanel />)
    await fireEvent(screen.getByTestId(EXTRA_SWITCH), 'valueChange', true)
    expect(updateSettings).toHaveBeenCalledWith({
      enhancedVerificationEnabled: true,
      password: undefined,
    })
    expect(screen.queryByTestId('security-settings-confirm')).toBeNull()
  })

  it('Should ask for the password before turning a protection off', async () => {
    await render(<SecuritySettingsPanel />)
    await fireEvent(screen.getByTestId(TRAVEL_SWITCH), 'valueChange', false)

    expect(updateSettings).not.toHaveBeenCalled()
    expect(
      screen.getByText('Turn off impossible travel detection?')
    ).toBeTruthy()
    expect(screen.getByTestId(TRAVEL_SWITCH).props.value).toBe(false)
    expect(
      screen.getByTestId('security-settings-confirm-button')
    ).toBeDisabled()

    await fireEvent.changeText(
      screen.getByTestId('security-settings-password'),
      'password123'
    )
    await fireEvent.press(
      screen.getByTestId('security-settings-confirm-button')
    )

    expect(updateSettings).toHaveBeenCalledWith({
      impossibleTravelDetectionEnabled: false,
      password: 'password123',
    })
    await waitFor(() =>
      expect(screen.queryByTestId('security-settings-confirm')).toBeNull()
    )
  })

  it('Should put the switch back when turning off is cancelled', async () => {
    await render(<SecuritySettingsPanel />)
    await fireEvent(screen.getByTestId(TRAVEL_SWITCH), 'valueChange', false)
    await fireEvent.press(screen.getByTestId('security-settings-cancel'))

    expect(screen.queryByTestId('security-settings-confirm')).toBeNull()
    expect(screen.getByTestId(TRAVEL_SWITCH).props.value).toBe(true)
    expect(updateSettings).not.toHaveBeenCalled()
  })

  it('Should show a wrong password under the password field', async () => {
    updateSettings.mockRejectedValue(
      new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        data: { code: 'STEP_UP_FAILED' },
        status: 401,
      } as AxiosResponse)
    )
    await render(<SecuritySettingsPanel />)
    await fireEvent(screen.getByTestId(TRAVEL_SWITCH), 'valueChange', false)
    await fireEvent.changeText(
      screen.getByTestId('security-settings-password'),
      'wrong'
    )
    await fireEvent.press(
      screen.getByTestId('security-settings-confirm-button')
    )

    expect(
      await screen.findByText('That password is not correct.')
    ).toBeTruthy()
    expect(screen.getByTestId('security-settings-confirm')).toBeTruthy()
  })

  it('Should show an error when turning a protection on fails', async () => {
    updateSettings.mockRejectedValue(new Error('boom'))
    await render(<SecuritySettingsPanel />)
    await fireEvent(screen.getByTestId(EXTRA_SWITCH), 'valueChange', true)

    expect(
      await screen.findByText(
        'Could not update your security settings. Please try again.'
      )
    ).toBeTruthy()
  })
})
