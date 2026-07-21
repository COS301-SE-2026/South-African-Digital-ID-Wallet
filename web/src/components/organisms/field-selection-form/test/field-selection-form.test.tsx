import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FieldSelectionForm } from '../field-selection-form'

describe('FieldSelectionForm', () => {
  it('renders mandatory identity document fields as locked and checked', () => {
    render(
      <FieldSelectionForm
        credentialId="credential-123"
        credentialType="identityDocument"
        onContinue={() => {}}
      />
    )
    const identityNumberSwitch = screen.getByRole('switch', {
      name: /identity number/i,
    })
    expect(identityNumberSwitch).toBeChecked()
    expect(identityNumberSwitch).toBeDisabled()
  })

  it('renders optional fields unchecked by default', () => {
    render(
      <FieldSelectionForm
        credentialId="credential-123"
        credentialType="identityDocument"
        onContinue={() => {}}
      />
    )
    expect(screen.getByRole('switch', { name: /gender/i })).not.toBeChecked()
  })

  it('toggles an optional field when clicked', async () => {
    const user = userEvent.setup()
    render(
      <FieldSelectionForm
        credentialId="credential-123"
        credentialType="identityDocument"
        onContinue={() => {}}
      />
    )
    const genderSwitch = screen.getByRole('switch', { name: /gender/i })
    await user.click(genderSwitch)
    expect(genderSwitch).toBeChecked()
  })

  it('selects all optional fields when "select all for official" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <FieldSelectionForm
        credentialId="credential-123"
        credentialType="identityDocument"
        onContinue={() => {}}
      />
    )
    await user.click(
      screen.getByRole('button', { name: /select all for official/i })
    )
    expect(screen.getByRole('switch', { name: /gender/i })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: /country of birth/i })
    ).toBeChecked()
  })

  it('calls onContinue with mandatory and selected optional fields', async () => {
    const user = userEvent.setup()
    const onContinue = jest.fn()
    render(
      <FieldSelectionForm
        credentialId="credential-123"
        credentialType="identityDocument"
        onContinue={onContinue}
      />
    )
    await user.click(screen.getByRole('switch', { name: /gender/i }))
    await user.click(
      screen.getByRole('button', { name: /review and continue/i })
    )
    expect(onContinue).toHaveBeenCalledWith({
      credentialId: 'credential-123',
      credentialType: 'identityDocument',
      mandatoryFields: [
        'Identity number',
        'Full surname',
        'Full forenames',
        'Date of birth',
        'Citizenship status',
        'Photograph',
      ],
      selectedOptionalFields: ['Gender'],
    })
  })

  it('renders drivers license fields when credentialType is driversLicense', () => {
    render(
      <FieldSelectionForm
        credentialId="credential-123"
        credentialType="driversLicense"
        onContinue={() => {}}
      />
    )
    expect(
      screen.getByRole('switch', { name: /license number/i })
    ).toBeInTheDocument()
  })
})
