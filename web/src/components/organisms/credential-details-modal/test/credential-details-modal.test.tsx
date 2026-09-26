import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CredentialDetailsModal } from '../credential-details-modal'
import type { CredentialDetail } from '../types'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill: _fill, ...props }: any) => <img {...props} />,
}))
jest.mock('@/components/atoms/modal', () => ({
  Modal: ({ children, isOpen }: any) => (isOpen ? <div>{children}</div> : null),
}))
jest.mock('@/components/organisms/revoke-credentials-modal', () => ({
  RevokeCredentialModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? (
      <button onClick={() => onConfirm({ reason: 'Other', notes: 'Test' })}>
        Confirm Revoke
      </button>
    ) : null,
}))
const credential = (
  id: string,
  status: CredentialDetail['status'] = 'Active'
): CredentialDetail => ({
  id,
  type: 'ID' as CredentialDetail['type'],
  label: `Credential ${id}`,
  displayReference: `REF-${id}`,
  status,
  issuedOn: '2026-01-01',
  expiresOn: '2027-01-01',
  citizen: {
    fullName: 'John Doe',
    idNumber: '9001015009087',
    dateOfBirth: '2000-01-01',
    email: 'john@test.com',
    phone: '0123456789',
    address: 'Pretoria',
  },
  issuedBy: {
    administrator: 'Admin User',
    department: 'Home Affairs',
    office: 'Pretoria Office',
    reference: 'REF-001',
  },
  activity: {
    verifications: 5,
    lastVerifiedOn: '2026-01-01',
    lastVerifiedAt: '',
    devicesUsed: 2,
  },
})
const createProps = () => ({
  isOpen: true,
  onClose: jest.fn(),
  citizenName: 'John Doe',
  credentials: [credential('1'), credential('2', 'Revoked')],
  onRevoke: jest.fn().mockResolvedValue(undefined),
  onReinstate: jest.fn().mockResolvedValue(undefined),
})
describe('CredentialDetailsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn()
  })
  it('renders and switches credentials', async () => {
    const user = userEvent.setup()
    render(<CredentialDetailsModal {...createProps()} />)
    expect(screen.getByAltText('John Doe profile')).toBeInTheDocument()
    expect(screen.getByText('REF-1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Credential 2' }))
    expect(screen.getByText('REF-2')).toBeInTheDocument()
  })
  it('revokes a credential', async () => {
    const user = userEvent.setup()
    const props = createProps()
    render(<CredentialDetailsModal {...props} />)
    await user.click(screen.getByRole('button', { name: 'Revoke Credential' }))
    await user.click(screen.getByRole('button', { name: 'Confirm Revoke' }))
    expect(props.onRevoke).toHaveBeenCalled()
  })
  it('reinstates a revoked credential', async () => {
    const user = userEvent.setup()
    const props = createProps()
    window.confirm = jest.fn().mockReturnValue(true)
    render(<CredentialDetailsModal {...props} />)
    await user.click(screen.getByRole('button', { name: 'Credential 2' }))
    await user.click(
      screen.getByRole('button', { name: 'Reinstate Credential' })
    )
    expect(props.onReinstate).toHaveBeenCalled()
  })
})
