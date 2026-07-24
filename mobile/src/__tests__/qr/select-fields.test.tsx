import { render, screen, fireEvent } from '@testing-library/react-native'
import SelectFieldsScreen from '@/app/qr/select-fields'

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

describe('SelectFieldsScreen', () => {
  it('shows Identity Document mandatory fields by default', async () => {
    await render(<SelectFieldsScreen />)

    expect(screen.getByText('Identity number')).toBeOnTheScreen()
    expect(screen.getByText('Photograph')).toBeOnTheScreen()
  })

  it("switches to Driver's license fields when that tab is pressed", async () => {
    await render(<SelectFieldsScreen />)

    await fireEvent.press(screen.getByText("Driver's license"))

    expect(screen.getByText('License number')).toBeOnTheScreen()
    expect(screen.getByText('Vehicle restrictions')).toBeOnTheScreen()
  })

  it('selects all optional fields when the official banner button is pressed', async () => {
    await render(<SelectFieldsScreen />)

    await fireEvent.press(screen.getByText('Select all for official'))

    expect(screen.getByText('All fields selected')).toBeOnTheScreen()
  })
})
