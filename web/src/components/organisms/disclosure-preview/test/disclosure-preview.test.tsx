import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisclosurePreview } from '../disclosure-preview'
import type { QrDisclosureSelection } from '@/services/qr-service'

const baseSelection: QrDisclosureSelection = {
  credentialId: 'credential-123',
  credentialType: 'identityDocument',
  mandatoryFields: ['Identity number', 'Full surname'],
  selectedOptionalFields: ['Gender'],
}

describe('DisclosurePreview', () => {
  it('renders the credential type label', () => {
    render(
      <DisclosurePreview
        selection={baseSelection}
        onConfirm={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.getByText('Identity document')).toBeInTheDocument()
  })

  it('renders all mandatory and selected optional fields', () => {
    render(
      <DisclosurePreview
        selection={baseSelection}
        onConfirm={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.getByText('Identity number')).toBeInTheDocument()
    expect(screen.getByText('Full surname')).toBeInTheDocument()
    expect(screen.getByText('Gender')).toBeInTheDocument()
  })

  it('does not render unselected optional fields', () => {
    render(
      <DisclosurePreview
        selection={baseSelection}
        onConfirm={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.queryByText('Country of birth')).not.toBeInTheDocument()
  })

  it('shows the correct field count summary', () => {
    render(
      <DisclosurePreview
        selection={baseSelection}
        onConfirm={() => {}}
        onBack={() => {}}
      />
    )
    expect(screen.getByText(/3 fields will be shared/i)).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    render(
      <DisclosurePreview
        selection={baseSelection}
        onConfirm={onConfirm}
        onBack={() => {}}
      />
    )
    await user.click(
      screen.getByRole('button', { name: /confirm and generate qr/i })
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = jest.fn()
    render(
      <DisclosurePreview
        selection={baseSelection}
        onConfirm={() => {}}
        onBack={onBack}
      />
    )
    await user.click(screen.getByRole('button', { name: /go back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
