import { fireEvent, screen } from '@testing-library/react-native'

import { renderWithSafeArea } from '@/test/utils/render-with-providers'

import {
  useEmergencyDeviceStatus,
  useEmergencyProfile,
  useRegisterEmergencyDevice,
} from '@/hooks'

import {
  EmergencyProfilePage,
  LockScreenSection,
  toSaveRequest,
  validateDraft,
} from '../emergency-profile-page'

import FlashidEmergency from '@/../modules/flashid-emergency'

const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
}))

jest.mock('@/hooks', () => ({
  __esModule: true,
  useEmergencyDeviceStatus: jest.fn(),
  useEmergencyProfile: jest.fn(),
  useRegisterEmergencyDevice: jest.fn(),
}))

const useProfileHook = useEmergencyProfile as jest.Mock
const useStatusHook = useEmergencyDeviceStatus as jest.Mock
const useRegisterHook = useRegisterEmergencyDevice as jest.Mock

const PROFILE = {
  consentGivenAt: '2026-09-01T10:00:00Z',
  contacts: [
    {
      email: null,
      name: 'Sipho Dlamini',
      phone: '0821234567',
      priority: 1,
      relationship: 'Brother',
    },
  ],
  fields: { bloodType: 'O negative' },
  isEnabled: true,
  medicalLastUpdatedAt: '2026-09-01T10:00:00Z',
  offlineFields: ['bloodType', 'name'],
}

const DRAFT = {
  consentGiven: true,
  contacts: [],
  fields: {
    allergies: '',
    bloodType: '',
    communication: '',
    conditions: '',
    implants: '',
    medicalAidNumber: '',
    medicalAidScheme: '',
    medication: '',
  },
  isEnabled: true,
  offlineFields: [],
}

const mockHooks = (overrides = {}) => {
  const save = jest.fn().mockResolvedValue(PROFILE)
  const register = jest.fn()
  useProfileHook.mockReturnValue({
    isLoading: false,
    isSaving: false,
    loadError: null,
    profile: PROFILE,
    save,
    saveError: null,
    ...overrides,
  })
  useStatusHook.mockReturnValue({ isChecking: false, isConfigured: false })
  useRegisterHook.mockReturnValue({
    error: null,
    isRegistering: false,
    register,
  })
  return { register, save }
}

describe('EmergencyProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Should show the saved profile', async () => {
    mockHooks()
    await renderWithSafeArea(<EmergencyProfilePage />)
    expect(screen.getByText('Emergency profile')).toBeTruthy()
    expect(screen.getByTestId('emergency-field-bloodType').props.value).toBe(
      'O negative'
    )
    expect(screen.getByTestId('emergency-contact-0-name').props.value).toBe(
      'Sipho Dlamini'
    )
  })

  it('Should show a loading message', async () => {
    mockHooks({ isLoading: true, profile: undefined })
    await renderWithSafeArea(<EmergencyProfilePage />)
    expect(screen.getByText('Loading your emergency profile…')).toBeTruthy()
  })

  it('Should show a load error', async () => {
    mockHooks({ loadError: new Error('down'), profile: undefined })
    await renderWithSafeArea(<EmergencyProfilePage />)
    expect(screen.getByTestId('emergency-load-error')).toBeTruthy()
  })

  it('Should go back', async () => {
    mockHooks()
    await renderWithSafeArea(<EmergencyProfilePage />)
    await fireEvent.press(screen.getByTestId('detail-back-button'))
    expect(mockBack).toHaveBeenCalled()
  })

  it('Should save the edited profile', async () => {
    const { save } = mockHooks()
    await renderWithSafeArea(<EmergencyProfilePage />)
    await fireEvent.changeText(
      screen.getByTestId('emergency-field-allergies'),
      'Penicillin'
    )
    await fireEvent.press(screen.getByTestId('emergency-save'))
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        consentGiven: true,
        fields: { allergies: 'Penicillin', bloodType: 'O negative' },
        isEnabled: true,
      })
    )
    expect(screen.getByTestId('emergency-saved')).toBeTruthy()
  })

  it('Should refuse to switch on without consent', async () => {
    const { save } = mockHooks({
      profile: { ...PROFILE, consentGivenAt: null, isEnabled: false },
    })
    await renderWithSafeArea(<EmergencyProfilePage />)
    await fireEvent(
      screen.getByTestId('emergency-enabled-switch'),
      'valueChange',
      true
    )
    await fireEvent.press(screen.getByTestId('emergency-save'))
    expect(save).not.toHaveBeenCalled()
    expect(screen.getByTestId('emergency-form-error')).toBeTruthy()
  })

  it('Should add and remove contacts up to the limit', async () => {
    mockHooks({ profile: { ...PROFILE, contacts: [] } })
    await renderWithSafeArea(<EmergencyProfilePage />)
    await fireEvent.press(screen.getByTestId('emergency-add-contact'))
    await fireEvent.press(screen.getByTestId('emergency-add-contact'))
    await fireEvent.press(screen.getByTestId('emergency-add-contact'))
    expect(screen.queryByTestId('emergency-add-contact')).toBeNull()
    await fireEvent.press(screen.getByTestId('emergency-contact-2-remove'))
    expect(screen.queryByTestId('emergency-contact-2')).toBeNull()
    await fireEvent.changeText(
      screen.getByTestId('emergency-contact-0-name'),
      'Ann'
    )
    await fireEvent.changeText(
      screen.getByTestId('emergency-contact-0-relationship'),
      'Mother'
    )
    await fireEvent.changeText(
      screen.getByTestId('emergency-contact-0-phone'),
      '0820000000'
    )
    await fireEvent.changeText(
      screen.getByTestId('emergency-contact-0-email'),
      'ann@example.com'
    )
    expect(screen.getByTestId('emergency-contact-0-email').props.value).toBe(
      'ann@example.com'
    )
  })

  it('Should toggle a field for offline use', async () => {
    const { save } = mockHooks()
    await renderWithSafeArea(<EmergencyProfilePage />)
    await fireEvent(
      screen.getByTestId('emergency-offline-bloodType-switch'),
      'valueChange',
      false
    )
    await fireEvent(
      screen.getByTestId('emergency-offline-name-switch'),
      'valueChange',
      false
    )
    await fireEvent(
      screen.getByTestId('emergency-offline-name-switch'),
      'valueChange',
      true
    )
    await fireEvent.press(screen.getByTestId('emergency-save'))
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ offlineFields: ['name'] })
    )
  })

  it('Should show a save error', async () => {
    const save = jest.fn().mockRejectedValue(new Error('500'))
    mockHooks({ save, saveError: new Error('500') })
    await renderWithSafeArea(<EmergencyProfilePage />)
    await fireEvent.press(screen.getByTestId('emergency-save'))
    expect(screen.getByTestId('emergency-save-error')).toBeTruthy()
  })

  it('Should set up the lock-screen button', async () => {
    const { register } = mockHooks()
    await renderWithSafeArea(<LockScreenSection isEnabled />)
    await fireEvent.press(screen.getByTestId('emergency-register-device'))
    expect(register).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    )
  })

  it('Should explain how to add the tile when Android cannot add it', async () => {
    mockHooks()
    useStatusHook.mockReturnValue({ isChecking: false, isConfigured: true })
    jest.spyOn(FlashidEmergency, 'requestAddTile').mockResolvedValue(false)
    await renderWithSafeArea(<LockScreenSection isEnabled />)
    await fireEvent.press(screen.getByTestId('emergency-add-tile'))
    expect(
      screen.getByText(/drag FlashID Emergency into your Quick Settings/)
    ).toBeTruthy()
  })

  it('Should ask to switch on the profile before the lock-screen setup', async () => {
    mockHooks()
    await renderWithSafeArea(<LockScreenSection isEnabled={false} />)
    expect(screen.queryByTestId('emergency-register-device')).toBeNull()
  })

  it('Should show a lock-screen setup error', async () => {
    mockHooks()
    useRegisterHook.mockReturnValue({
      error: new Error('409'),
      isRegistering: false,
      register: jest.fn(),
    })
    await renderWithSafeArea(<LockScreenSection isEnabled />)
    expect(screen.getByText(/could not be set up/)).toBeTruthy()
  })
})

describe('validateDraft', () => {
  it('Should accept a complete draft', () => {
    expect(validateDraft(DRAFT)).toBeNull()
  })

  it('Should need a relationship for each contact', () => {
    expect(
      validateDraft({
        ...DRAFT,
        contacts: [{ email: '', name: 'A', phone: '1', relationship: '' }],
      })
    ).toMatch(/related/)
  })

  it('Should need a phone or email for each contact', () => {
    expect(
      validateDraft({
        ...DRAFT,
        contacts: [{ email: '', name: 'A', phone: '', relationship: 'B' }],
      })
    ).toMatch(/phone number or email/)
  })
})

describe('toSaveRequest', () => {
  it('Should drop blank values and number contacts in order', () => {
    const request = toSaveRequest({
      ...DRAFT,
      contacts: [
        { email: '', name: ' ', phone: '', relationship: '' },
        { email: ' a@b.co ', name: ' Ann ', phone: '', relationship: 'Mom' },
      ],
      fields: { ...DRAFT.fields, allergies: '  Nuts ' },
      offlineFields: ['allergies', 'bloodType', 'name'],
    })
    expect(request.fields).toEqual({ allergies: 'Nuts' })
    expect(request.offlineFields).toEqual(['allergies', 'name'])
    expect(request.contacts).toEqual([
      {
        email: 'a@b.co',
        name: 'Ann',
        phone: null,
        priority: 1,
        relationship: 'Mom',
      },
    ])
  })
})
