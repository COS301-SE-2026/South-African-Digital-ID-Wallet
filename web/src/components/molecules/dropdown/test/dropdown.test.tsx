import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dropdown } from '../dropdown'

const options = [
  { label: 'Home Affairs', value: 'home_affairs' },
  { label: 'Licensing Department', value: 'licensing' },
]

describe('Dropdown', () => {
  it('renders the label', () => {
    render(
      <Dropdown
        label="Institution Type"
        options={options}
        value=""
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Institution Type')).toBeInTheDocument()
  })

  it('opens the option list when the input is clicked', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={options} value="" onChange={() => {}} />)
    await user.click(screen.getByRole('textbox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Home Affairs' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Licensing Department' })
    ).toBeInTheDocument()
  })

  it('calls onChange with the selected value when an option is clicked', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<Dropdown options={options} value="" onChange={onChange} />)
    await user.click(screen.getByRole('textbox'))
    await user.click(screen.getByRole('option', { name: 'Home Affairs' }))
    expect(onChange).toHaveBeenCalledWith('home_affairs')
  })

  it('filters options when the user types in the search input', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={options} value="" onChange={() => {}} />)
    await user.click(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'home')
    expect(
      screen.getByRole('option', { name: 'Home Affairs' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Licensing Department' })
    ).not.toBeInTheDocument()
  })

  it('shows "No results found" when the search matches nothing', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={options} value="" onChange={() => {}} />)
    await user.click(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'xyz')
    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })

  it('displays the selected option label in the input when closed', () => {
    render(
      <Dropdown options={options} value="home_affairs" onChange={() => {}} />
    )
    expect(screen.getByRole('textbox')).toHaveValue('Home Affairs')
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={options} value="" onChange={() => {}} disabled />)
    await user.click(screen.getByRole('textbox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows the error message when hasError and errorMessage are set', () => {
    render(
      <Dropdown
        options={options}
        value=""
        onChange={() => {}}
        hasError
        errorMessage="This field is required"
      />
    )
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('accepts plain string options', async () => {
    const user = userEvent.setup()
    render(
      <Dropdown
        options={['Option A', 'Option B']}
        value=""
        onChange={() => {}}
      />
    )
    await user.click(screen.getByRole('textbox'))
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument()
  })

  it('marks the currently selected option with aria-selected', async () => {
    const user = userEvent.setup()
    render(<Dropdown options={options} value="licensing" onChange={() => {}} />)
    await user.click(screen.getByRole('textbox'))
    expect(
      screen.getByRole('option', { name: 'Licensing Department' })
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('option', { name: 'Home Affairs' })
    ).toHaveAttribute('aria-selected', 'false')
  })
})
