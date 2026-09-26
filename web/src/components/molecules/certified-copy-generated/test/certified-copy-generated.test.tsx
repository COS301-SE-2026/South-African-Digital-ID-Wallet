import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertifiedCopyGenerated } from '../certified-copy-generated'
import type { CredentialResponse } from '@/services/credential-service'

const credential = {
  id: 'credential-1',
  type: 'IdentityDocument',
  title: 'National ID Card',
  status: 'Active',
  issueDate: '2026-02-12T00:00:00Z',
  identityDocument: {
    idNumber: '0001010001088',
  },
  driversLicense: null,
} as CredentialResponse
const generatedAt = '2026-09-25T19:55:00.000Z'
const renderComponent = (onBack = jest.fn()) =>
  render(
    <CertifiedCopyGenerated
      credential={credential}
      generatedAt={generatedAt}
      onBack={onBack}
    />
  )
describe('CertifiedCopyGenerated', () => {
  it('renders the certified copy success dialog', () => {
    renderComponent()
    const dialog = screen.getByRole('dialog', {
      name: /certified copy generated/i,
    })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByRole('heading', {
        name: /your certified copy is ready/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/digitally generated and verifiable document/i)
    ).toBeInTheDocument()
  })
  it('renders all available actions', () => {
    renderComponent()
    expect(
      screen.getByRole('button', { name: /download pdf/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send to email/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /view in new tab/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /back to my credentials/i })
    ).toBeInTheDocument()
  })
  it('calls onBack when Back to My Credentials is clicked', async () => {
    const user = userEvent.setup()
    const onBack = jest.fn()
    renderComponent(onBack)
    await user.click(
      screen.getByRole('button', {
        name: /back to my credentials/i,
      })
    )
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})