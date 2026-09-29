import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QrGenerationPage } from '../qr-generation-page'
import type { QrDisclosureSelection } from '@/services/qr-service'

const baseSelection: QrDisclosureSelection = {
  credentialId: 'credential-123',
  credentialType: 'identityDocument',
  mandatoryFields: ['Identity number'],
  selectedOptionalFields: [],
}

jest.mock('@/components/organisms', () => ({
  CredentialSelector: ({
    onSelect,
  }: {
    onSelect: (id: string, type: string) => void
  }) => (
    <button onClick={() => onSelect('credential-123', 'identityDocument')}>
      select-credential
    </button>
  ),
  FieldSelectionForm: ({
    onContinue,
  }: {
    onContinue: (selection: QrDisclosureSelection) => void
  }) => (
    <button onClick={() => onContinue(baseSelection)}>
      continue-field-selection
    </button>
  ),
  DisclosurePreview: ({
    onConfirm,
    onBack,
  }: {
    onConfirm: () => void
    onBack: () => void
  }) => (
    <div>
      <button onClick={onConfirm}>confirm-preview</button>
      <button onClick={onBack}>back-to-fields</button>
    </div>
  ),
  QrDisplay: ({ onBack }: { onBack: () => void }) => (
    <button onClick={onBack}>back-to-preview</button>
  ),
}))

describe('QrGenerationPage', () => {
  it('renders the credential selector as the first step', () => {
    render(<QrGenerationPage />)
    expect(screen.getByText('select-credential')).toBeInTheDocument()
  })

  it('advances to field selection after selecting a credential', async () => {
    const user = userEvent.setup()
    render(<QrGenerationPage />)
    await user.click(screen.getByText('select-credential'))
    expect(screen.getByText('continue-field-selection')).toBeInTheDocument()
  })

  it('advances to preview after continuing field selection', async () => {
    const user = userEvent.setup()
    render(<QrGenerationPage />)
    await user.click(screen.getByText('select-credential'))
    await user.click(screen.getByText('continue-field-selection'))
    expect(screen.getByText('confirm-preview')).toBeInTheDocument()
  })

  it('advances to display after confirming the preview', async () => {
    const user = userEvent.setup()
    render(<QrGenerationPage />)
    await user.click(screen.getByText('select-credential'))
    await user.click(screen.getByText('continue-field-selection'))
    await user.click(screen.getByText('confirm-preview'))
    expect(screen.getByText('back-to-preview')).toBeInTheDocument()
  })

  it('goes back to field selection from preview', async () => {
    const user = userEvent.setup()
    render(<QrGenerationPage />)
    await user.click(screen.getByText('select-credential'))
    await user.click(screen.getByText('continue-field-selection'))
    await user.click(screen.getByText('back-to-fields'))
    expect(screen.getByText('continue-field-selection')).toBeInTheDocument()
  })
})
