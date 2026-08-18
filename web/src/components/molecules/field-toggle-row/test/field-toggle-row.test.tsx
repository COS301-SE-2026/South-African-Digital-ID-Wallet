import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FieldToggleRow } from '../field-toggle-row'

describe('FieldToggleRow', () => {
  it('renders the label', () => {
    render(
      <FieldToggleRow
        label="Identity number"
        checked={true}
        onCheckedChange={() => {}}
      />
    )
    expect(screen.getByText('Identity number')).toBeInTheDocument()
  })

  it('renders the label with black text', () => {
    render(
      <FieldToggleRow
        label="Identity number"
        checked={true}
        onCheckedChange={() => {}}
      />
    )

    expect(screen.getByText('Identity number')).toHaveClass('text-black')
  })

  it('renders as checked when checked is true', () => {
    render(
      <FieldToggleRow
        label="Full surname"
        checked={true}
        onCheckedChange={() => {}}
      />
    )
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('renders as unchecked when checked is false', () => {
    render(
      <FieldToggleRow
        label="Gender"
        checked={false}
        onCheckedChange={() => {}}
      />
    )
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    render(
      <FieldToggleRow
        label="Country of birth"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    )
    await user.click(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('disables the switch when locked', () => {
    render(
      <FieldToggleRow
        label="Identity number"
        checked={true}
        onCheckedChange={() => {}}
        locked
      />
    )
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('does not call onCheckedChange when locked and clicked', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    render(
      <FieldToggleRow
        label="Identity number"
        checked={true}
        onCheckedChange={onCheckedChange}
        locked
      />
    )
    await user.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
