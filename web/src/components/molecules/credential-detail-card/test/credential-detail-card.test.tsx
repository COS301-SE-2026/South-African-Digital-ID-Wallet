import { render, screen } from '@testing-library/react'
import { IdCard } from 'lucide-react'
import { CredentialDetailCard } from '@/components/molecules'
import type { CredentialView } from '@/services/credential-service'

const view: CredentialView = {
  id: 'id-1',
  title: 'National ID Card',
  issuer: 'Department of Home Affairs',
  icon: IdCard,
  statusLabel: 'Verified',
  statusIntent: 'active',
  rows: [
    { label: 'ID number', value: '0001010001088' },
    { label: 'Nationality', value: 'South African' },
  ],
}

describe('CredentialDetailCard', () => {
  it('The title, issuer and status should render', () => {
    render(<CredentialDetailCard credential={view} />)
    expect(screen.getByText('National ID Card')).toBeInTheDocument()
    expect(screen.getByText('Department of Home Affairs')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('The every detail row should render', () => {
    render(<CredentialDetailCard credential={view} />)
    expect(screen.getByText('ID number')).toBeInTheDocument()
    expect(screen.getByText('0001010001088')).toBeInTheDocument()
    expect(screen.getByText('Nationality')).toBeInTheDocument()
    expect(screen.getByText('South African')).toBeInTheDocument()
  })

  it('does not render a Share QR code button', () => {
    render(<CredentialDetailCard credential={view} />)
    expect(
      screen.queryByRole('button', { name: /share qr code/i })
    ).not.toBeInTheDocument()
  })
})
