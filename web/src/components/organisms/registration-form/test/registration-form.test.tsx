import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationForm } from '../registration-form'

const VALID_ID = '1234567890123'
const VALID_USERNAME = 'testuser1'
const VALID_PASSWORD = 'Password1!'
const VALID_CODE = 'ACTIVATION123'

function getSubmitButton() {
  return screen.getByRole('button', { name: /create account/i })
}

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: {
    id?: string
    username?: string
    password?: string
    confirm?: string
    code?: string
  } = {}
) {
  const {
    id = VALID_ID,
    username = VALID_USERNAME,
    password = VALID_PASSWORD,
    confirm = VALID_PASSWORD,
    code = VALID_CODE,
  } = overrides

  if (id) await user.type(screen.getByLabelText('ID number:'), id)
  if (username) await user.type(screen.getByLabelText('Username:'), username)
  if (password) await user.type(screen.getByLabelText('Password:'), password)
  if (confirm)
    await user.type(screen.getByLabelText('Verify password:'), confirm)
  if (code) await user.type(screen.getByLabelText('Activation code:'), code)
}

describe('RegistrationForm — unit tests', () => {
  describe('rendering', () => {
    it('renders all required form fields', () => {
      render(<RegistrationForm />)
      expect(screen.getByLabelText('ID number:')).toBeInTheDocument()
      expect(screen.getByLabelText('Username:')).toBeInTheDocument()
      expect(screen.getByLabelText('Password:')).toBeInTheDocument()
      expect(screen.getByLabelText('Verify password:')).toBeInTheDocument()
      expect(screen.getByLabelText('Activation code:')).toBeInTheDocument()
    })

    it('renders the Create Account submit button', () => {
      render(<RegistrationForm />)
      expect(getSubmitButton()).toBeInTheDocument()
    })

    it('submit button is disabled on initial render', () => {
      render(<RegistrationForm />)
      expect(getSubmitButton()).toBeDisabled()
    })

    it('Physical Verification button is disabled', () => {
      render(<RegistrationForm />)
      expect(
        screen.getByRole('button', { name: /physical verification/i })
      ).toBeDisabled()
    })

    it('Physical Verification button shows a Soon badge', () => {
      render(<RegistrationForm />)
      const physBtn = screen.getByRole('button', {
        name: /physical verification/i,
      })
      expect(within(physBtn).getByText(/soon/i)).toBeInTheDocument()
    })

    it('renders a link to the login page', () => {
      render(<RegistrationForm />)
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })

    it('activation code field is visible by default', () => {
      render(<RegistrationForm />)
      expect(screen.getByLabelText('Activation code:')).toBeVisible()
    })
  })

  describe('ID Number validation', () => {
    it('submit stays disabled when ID number has fewer than 13 characters', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), '123456789012')
      expect(getSubmitButton()).toBeDisabled()
    })

    it('submit stays disabled when ID number has more than 13 characters', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), '12345678901234')
      expect(getSubmitButton()).toBeDisabled()
    })

    it('strips spaces so that spaced input is stored without them', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), '123 456 789 0123')
      expect(screen.getByLabelText('ID number:')).toHaveValue('1234567890123')
    })

    it('13 alphabetic characters must NOT satisfy the Exactly 13 digits requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmitAction={jest.fn()} />)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
      await user.type(screen.getByLabelText('ID number:'), 'AAAAAAAAAAAAA')
      expect(getSubmitButton()).toBeDisabled()
    })

    it('13 non-digit characters mixed with dots must NOT satisfy the Exactly 13 digits requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmitAction={jest.fn()} />)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
      await user.type(screen.getByLabelText('ID number:'), 'AAAAAAAAAAAA.')
      expect(getSubmitButton()).toBeDisabled()
    })

    it('10 digits followed by 3 letters must be treated as invalid', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm onSubmitAction={jest.fn()} />)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
      await user.type(screen.getByLabelText('ID number:'), '1234567890ABC')
      expect(getSubmitButton()).toBeDisabled()
    })
  })

  describe('Username validation', () => {
    it('submit stays disabled when username has fewer than 8 characters', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('Username:'), 'abc1234')
      expect(getSubmitButton()).toBeDisabled()
    })

    it('a username of exactly 8 characters satisfies the requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, { username: 'user1234' })
      expect(getSubmitButton()).not.toBeDisabled()
    })

    it('strips spaces from the username field', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('Username:'), 'test user')
      expect(screen.getByLabelText('Username:')).toHaveValue('testuser')
    })
  })

  describe('Password validation', () => {
    it('rejects a password shorter than 10 characters', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), VALID_ID)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), 'Short1!')
      await user.type(screen.getByLabelText('Verify password:'), 'Short1!')
      await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
      expect(getSubmitButton()).toBeDisabled()
    })

    it('rejects a password with no uppercase letter', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, {
        password: 'nouppercase1!',
        confirm: 'nouppercase1!',
      })
      expect(getSubmitButton()).toBeDisabled()
    })

    it('rejects a password with no lowercase letter', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, {
        password: 'NOLOWERCASE1!',
        confirm: 'NOLOWERCASE1!',
      })
      expect(getSubmitButton()).toBeDisabled()
    })

    it('rejects a password that contains no digit', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, {
        password: 'NoDigitPass!',
        confirm: 'NoDigitPass!',
      })
      expect(getSubmitButton()).toBeDisabled()
    })

    it('rejects a password that contains no special character', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, {
        password: 'NoSpecial1234',
        confirm: 'NoSpecial1234',
      })
      expect(getSubmitButton()).toBeDisabled()
    })

    it('rejects a password whose only special character is a parenthesis', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, {
        password: 'Password1(',
        confirm: 'Password1(',
      })
      expect(getSubmitButton()).toBeDisabled()
    })

    it('accepts a password that meets every requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user)
      expect(getSubmitButton()).not.toBeDisabled()
    })

    it('strips spaces from the password field', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('Password:'), 'Pass word1!')
      expect(screen.getByLabelText('Password:')).toHaveValue('Password1!')
    })
  })

  describe('Confirm Password validation', () => {
    it('rejects when the confirm password field is empty', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), VALID_ID)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
      expect(getSubmitButton()).toBeDisabled()
    })

    it('rejects when confirm password does not match password', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user, { confirm: 'DifferentPass1!' })
      expect(getSubmitButton()).toBeDisabled()
    })

    it('accepts when confirm password exactly matches password', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user)
      expect(getSubmitButton()).not.toBeDisabled()
    })

    it('rejects when both password and confirm are empty', () => {
      render(<RegistrationForm />)
      expect(getSubmitButton()).toBeDisabled()
    })
  })

  describe('Activation Code validation', () => {
    it('blocks submit when activation code is not filled in', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), VALID_ID)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
      expect(getSubmitButton()).toBeDisabled()
    })

    it('blocks submit when activation code is only whitespace', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await user.type(screen.getByLabelText('ID number:'), VALID_ID)
      await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
      await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
      await user.type(screen.getByLabelText('Activation code:'), '   ')
      expect(getSubmitButton()).toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('does not call onSubmitAction when the form is invalid and submit is clicked', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<RegistrationForm onSubmitAction={onSubmit} />)
      await user.click(getSubmitButton())
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('does not call onSubmitAction when Enter is pressed while the form is invalid', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<RegistrationForm onSubmitAction={onSubmit} />)
      await user.type(screen.getByLabelText('ID number:'), '123')
      await user.keyboard('{Enter}')
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('calls onSubmitAction once with the correct payload when the form is valid', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<RegistrationForm onSubmitAction={onSubmit} />)
      await fillValidForm(user)
      await user.click(getSubmitButton())

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith({
        idnumber: VALID_ID,
        username: VALID_USERNAME,
        password: VALID_PASSWORD,
        activationCode: VALID_CODE,
        verificationMethod: 'activation',
      })
    })

    it('does not throw when onSubmitAction prop is not provided', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillValidForm(user)
      await expect(user.click(getSubmitButton())).resolves.not.toThrow()
    })

    it('the submitted payload does not contain a confirmPassword field', async () => {
      const user = userEvent.setup()
      const onSubmit = jest.fn()
      render(<RegistrationForm onSubmitAction={onSubmit} />)
      await fillValidForm(user)
      await user.click(getSubmitButton())

      expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('confirmPassword')
    })
  })
})

describe('RegistrationForm — integration tests', () => {
  it('submit button remains disabled until every field satisfies its requirements', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    expect(getSubmitButton()).toBeDisabled()

    await user.type(screen.getByLabelText('ID number:'), VALID_ID)
    expect(getSubmitButton()).toBeDisabled()

    await user.type(screen.getByLabelText('Username:'), VALID_USERNAME)
    expect(getSubmitButton()).toBeDisabled()

    await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
    expect(getSubmitButton()).toBeDisabled()

    await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
    expect(getSubmitButton()).toBeDisabled()

    await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
    expect(getSubmitButton()).not.toBeDisabled()
  })

  it('changing password after confirm was matched re-invalidates the form', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    await fillValidForm(user)
    expect(getSubmitButton()).not.toBeDisabled()

    const passwordField = screen.getByLabelText('Password:')
    await user.clear(passwordField)
    await user.type(passwordField, 'NewPassword1!')

    expect(getSubmitButton()).toBeDisabled()
  })

  it('spaces typed into ID and username are excluded from the submitted payload', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RegistrationForm onSubmitAction={onSubmit} />)

    await user.type(screen.getByLabelText('ID number:'), '123 456 789 0123')
    await user.type(screen.getByLabelText('Username:'), 'test user 1')
    await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
    await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
    await user.type(screen.getByLabelText('Activation code:'), VALID_CODE)
    await user.click(getSubmitButton())

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        idnumber: '1234567890123',
        username: 'testuser1',
      })
    )
  })

  it('verificationMethod in the payload defaults to activation', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RegistrationForm onSubmitAction={onSubmit} />)
    await fillValidForm(user)
    await user.click(getSubmitButton())

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ verificationMethod: 'activation' })
    )
  })

  it('the payload contains exactly the five expected keys', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RegistrationForm onSubmitAction={onSubmit} />)
    await fillValidForm(user)
    await user.click(getSubmitButton())

    expect(Object.keys(onSubmit.mock.calls[0][0]).sort()).toEqual([
      'activationCode',
      'idnumber',
      'password',
      'username',
      'verificationMethod',
    ])
  })

  it('does not submit when only the password field is filled', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RegistrationForm onSubmitAction={onSubmit} />)
    await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
    await user.click(getSubmitButton())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submitting a second time calls onSubmitAction again', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RegistrationForm onSubmitAction={onSubmit} />)
    await fillValidForm(user)
    await user.click(getSubmitButton())
    await user.click(getSubmitButton())
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
})
