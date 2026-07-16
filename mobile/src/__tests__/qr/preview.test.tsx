import { render, screen } from '@testing-library/react-native'
import PreviewScreen from '@/app/qr/preview'
import { useQrDisclosureStore } from '@/stores/qrDisclosureStore'

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

describe('PreviewScreen', () => {
  beforeEach(() => {
    useQrDisclosureStore.setState({
      credentialId: 'test-credential-id',
      credentialType: 'identityDocument',
      mandatoryFields: ['Full name', 'SA ID number'],
      selectedOptionalFields: ['Gender'],
    })
  })

  it('displays all mandatory and selected optional fields', async () => {
    await render(<PreviewScreen />)

    expect(screen.getByText('Full name')).toBeOnTheScreen()
    expect(screen.getByText('SA ID number')).toBeOnTheScreen()
    expect(screen.getByText('Gender')).toBeOnTheScreen()
  })

  it('shows the correct field count summary', async () => {
    await render(<PreviewScreen />)

    expect(screen.getByText('3 fields will be shared')).toBeOnTheScreen()
  })
})
