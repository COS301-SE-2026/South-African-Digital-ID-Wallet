import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VerificationFailure } from '../verification-failure'

describe('VerificationFailure', () => {
  it('renders the failure message', () => {
    render(
      <VerificationFailure
        message="We could not verify your identity."
        onTryAgain={jest.fn()}
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Verification unsuccessful' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('We could not verify your identity.')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Try Again' })
    ).toBeInTheDocument()
  })
  it('calls onTryAgain when clicked', async () => {
    const user = userEvent.setup()
    const onTryAgain = jest.fn()
    render(
      <VerificationFailure
        message="Verification failed."
        onTryAgain={onTryAgain}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(onTryAgain).toHaveBeenCalledTimes(1)
  })
})
