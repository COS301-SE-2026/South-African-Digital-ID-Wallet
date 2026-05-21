import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountTerminationModal } from '../account-termination-modal'

describe('AccountTerminationModal', () => {
  it('does not render when closed', () => {
    render(
      <AccountTerminationModal
        open={false}
        onCloseAction={jest.fn()}
        onConfirmAction={jest.fn()}
      />
    )

    expect(
      screen.queryByRole('button', { name: /yes, terminate account/i })
    ).not.toBeInTheDocument()
  })

  it('renders actions when open', () => {
    render(
      <AccountTerminationModal
        open={true}
        onCloseAction={jest.fn()}
        onConfirmAction={jest.fn()}
      />
    )

    expect(
      screen.getByRole('button', { name: /yes, terminate account/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls the confirm handler when terminated', async () => {
    const user = userEvent.setup()
    const onConfirmAction = jest.fn()

    render(
      <AccountTerminationModal
        open={true}
        onCloseAction={jest.fn()}
        onConfirmAction={onConfirmAction}
      />
    )

    await user.click(
      screen.getByRole('button', { name: /yes, terminate account/i })
    )

    expect(onConfirmAction).toHaveBeenCalled()
  })
})
