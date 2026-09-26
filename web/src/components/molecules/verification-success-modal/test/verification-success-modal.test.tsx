import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VerificationSuccessModal } from '../verification-success-modal'

jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn(),
}))
describe('VerificationSuccessModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <VerificationSuccessModal
        open={false}
        variant="id-document"
        fullName="Jane Doe"
        credentialValue="1234567890123"
        onContinueAction={jest.fn()}
        onDismissAction={jest.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })
  it('renders the credential details and calls actions', async () => {
    const user = userEvent.setup()
    const onContinueAction = jest.fn()
    const onDismissAction = jest.fn()
    render(
      <VerificationSuccessModal
        open
        variant="drivers-licence"
        fullName="Jane Doe"
        credentialValue="DL-998877"
        onContinueAction={onContinueAction}
        onDismissAction={onDismissAction}
      />
    )
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('DL-998877')).toBeInTheDocument()
    expect(screen.getByText("Driver's Licence")).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /continue to activate credentials/i })
    )
    expect(onContinueAction).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /do this later/i }))
    expect(onDismissAction).toHaveBeenCalled()
  })
})