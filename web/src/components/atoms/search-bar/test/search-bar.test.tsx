import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../search-bar'

describe('SearchBar', () => {
  it('renders with the provided value and default placeholder', () => {
    render(<SearchBar value="Thabo Ndlovu" onChange={jest.fn()} />)
    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Thabo Ndlovu')
  })

  it('renders a custom placeholder when provided', () => {
    render(
      <SearchBar
        value=""
        placeholder="Search citizen, ID number..."
        onChange={jest.fn()}
      />
    )
    expect(
      screen.getByPlaceholderText('Search citizen, ID number...')
    ).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<SearchBar value="" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'abc')
    expect(handleChange).toHaveBeenCalledTimes(3)
  })

  it('disables the input when disabled is true', () => {
    render(<SearchBar value="" onChange={jest.fn()} disabled />)
    expect(screen.getByPlaceholderText('Search...')).toBeDisabled()
  })

  it('is enabled by default', () => {
    render(<SearchBar value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText('Search...')).toBeEnabled()
  })

  it('merges custom className onto the wrapper', () => {
    const { container } = render(
      <SearchBar value="" onChange={jest.fn()} className="max-w-md" />
    )
    expect(container.firstChild).toHaveClass('max-w-md')
  })

  it('renders the search icon', () => {
    const { container } = render(<SearchBar value="" onChange={jest.fn()} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
