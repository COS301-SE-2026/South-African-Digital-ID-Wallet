import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertifiedCredentialCard } from '@/components/molecules'
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
const onViewCredential = jest.fn()
const onGenerateCertifiedCopy = jest.fn()
const renderCard = () =>
  render(
    <CertifiedCredentialCard
      credential={credential}
      onViewCredential={onViewCredential}
      onGenerateCertifiedCopy={onGenerateCertifiedCopy}
    />
  )
describe('CertifiedCredentialCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('renders the credential information', () => {
    renderCard()
    expect(screen.getByText('National ID Card')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('ID number')).toBeInTheDocument()
    expect(screen.getByText('0001010001088')).toBeInTheDocument()
    expect(screen.getByText('Issued')).toBeInTheDocument()
    expect(screen.getByText('12 Feb 2026')).toBeInTheDocument()
    expect(screen.getByText('Expires')).toBeInTheDocument()
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })
  it('renders both credential action buttons', () => {
    renderCard()
    expect(
      screen.getByRole('button', { name: /view credential/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /generate certified copy/i })
    ).toBeInTheDocument()
  })
  it('calls onViewCredential when View Credential is clicked', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(
      screen.getByRole('button', { name: /view credential/i })
    )
    expect(onViewCredential).toHaveBeenCalledTimes(1)
    expect(onViewCredential).toHaveBeenCalledWith(credential)
  })
  it('calls onGenerateCertifiedCopy when Generate Certified Copy is clicked', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(
      screen.getByRole('button', { name: /generate certified copy/i })
    )
    expect(onGenerateCertifiedCopy).toHaveBeenCalledTimes(1)
    expect(onGenerateCertifiedCopy).toHaveBeenCalledWith(credential)
  })
})