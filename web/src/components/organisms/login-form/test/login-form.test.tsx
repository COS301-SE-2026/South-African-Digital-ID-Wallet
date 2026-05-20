import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/organisms'

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('calls onSubmitAction with email and password on submit', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<LoginForm onSubmitAction={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    })
  })

  it('does not call onSubmitAction when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<LoginForm onSubmitAction={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
