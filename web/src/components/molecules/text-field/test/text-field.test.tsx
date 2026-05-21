import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from '../text-field'

describe('TextField', () => {
  it('renders an input', () => {
    render(<TextField />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders a label associated with the input', () => {
    render(<TextField label="Full Name" />)
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
  })

  it('renders helper text when provided', () => {
    render(<TextField helperText="Enter your full name" />)
    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
  })

  it('renders the error message and sets aria-invalid when error is provided', () => {
    render(<TextField error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows error instead of helper text when both are provided', () => {
    render(<TextField error="Error!" helperText="Helper" />)
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.queryByText('Helper')).not.toBeInTheDocument()
  })

  it('forwards the placeholder prop to the input', () => {
    render(<TextField placeholder="Type here..." />)
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  it('is disabled when the disabled prop is set', () => {
    render(<TextField disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<TextField onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'Hello')
    expect(onChange).toHaveBeenCalled()
  })
})
