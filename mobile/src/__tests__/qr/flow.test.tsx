import { render, screen, fireEvent } from '@testing-library/react-native'
import SelectFieldsScreen from '@/app/qr/select-fields'
import PreviewScreen from '@/app/qr/preview'
import { useQrDisclosureStore } from '@/stores/qrDisclosureStore'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}))

describe('QR disclosure flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useQrDisclosureStore.setState({
      credentialId: 'test-credential-id',
      credentialType: 'identityDocument',
      mandatoryFields: [],
      selectedOptionalFields: [],
    })
  })

  it('carries selected fields from select-fields into the store, and preview reflects them', async () => {
    await render(<SelectFieldsScreen />)

    await fireEvent.press(screen.getByText('Select all for official'))
    await fireEvent.press(screen.getByText('Review and continue'))

    expect(mockPush).toHaveBeenCalledWith('/qr/preview')

    const state = useQrDisclosureStore.getState()
    expect(state.credentialId).toBe('test-credential-id')
    expect(state.mandatoryFields).toContain('Identity number')
    expect(state.selectedOptionalFields).toContain('Gender')

    await render(<PreviewScreen />)

    expect(screen.getByText('Identity number')).toBeOnTheScreen()
    expect(screen.getByText('Gender')).toBeOnTheScreen()
  }, 15000)
})
