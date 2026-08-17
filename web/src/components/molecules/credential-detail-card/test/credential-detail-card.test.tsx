import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IdCard } from 'lucide-react'
import { CredentialDetailCard } from '@/components/molecules'
import type { CredentialView } from '@/services/credential-service'

jest.mock('@/components/organisms', () => ({
  __esModule: true,

  FieldSelectionForm: ({
    onContinue,
  }: {
    credentialId: string
    credentialType: string
    onBack: () => void
    onContinue: (selection: unknown) => void
    onSelectionChange: (selection: unknown) => void
    continueLabel?: string
  }) => (
    <div>
      <h3>Choose what to share</h3>

      <button
        type="button"
        onClick={() =>
          onContinue({
            credentialId: 'id-1',
            credentialType: 'identityDocument',
            mandatoryFields: [],
            selectedOptionalFields: [],
          })
        }
      >
        Generate QR code
      </button>
    </div>
  ),

  QrDisplay: ({
    onBack,
  }: {
    selection: unknown
    onBack: () => void
    embedded?: boolean
    compact?: boolean
    showBackButton?: boolean
  }) => (
    <div>
      <div>qr-display-panel</div>

      <button type="button" onClick={onBack}>
        back-to-disclosure
      </button>
    </div>
  ),
}))

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
  }

  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
    }
  }
})

const view: CredentialView = {
  id: 'id-1',
  title: 'National ID Card',
  issuer: 'Department of Home Affairs',
  qrCredentialType: 'identityDocument',
  icon: IdCard,
  statusLabel: 'Verified',
  statusIntent: 'active',
  rows: [
    {
      label: 'ID number',
      value: '0001010001088',
    },
    {
      label: 'Nationality',
      value: 'South African',
    },
  ],
}

describe('CredentialDetailCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('renders the credential title, issuer and status', () => {
    render(<CredentialDetailCard credential={view} />)

    expect(screen.getByText('National ID Card')).toBeInTheDocument()

    expect(
      screen.getByText(/issued by department of home affairs/i)
    ).toBeInTheDocument()

    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('renders every credential detail row', () => {
    render(<CredentialDetailCard credential={view} />)

    expect(screen.getByText('ID number')).toBeInTheDocument()

    expect(screen.getByText('0001010001088')).toBeInTheDocument()

    expect(screen.getByText('Nationality')).toBeInTheDocument()

    expect(screen.getByText('South African')).toBeInTheDocument()
  })

  it('renders the Share Credential button', () => {
    render(<CredentialDetailCard credential={view} />)

    expect(
      screen.getByRole('button', {
        name: /share credential/i,
      })
    ).toBeInTheDocument()
  })
  it('opens the share dialog when Share Credential is clicked', async () => {
    const user = userEvent.setup()

    render(<CredentialDetailCard credential={view} />)

    await user.click(
      screen.getByRole('button', {
        name: /share credential/i,
      })
    )

    const dialog = await screen.findByRole('dialog', {
      name: /share national id card/i,
    })

    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-labelledby', 'share-credential-title')

    expect(
      within(dialog).getByText(/choose what to share/i)
    ).toBeInTheDocument()
  })

  it('closes the share dialog when Close is clicked', async () => {
    const user = userEvent.setup()

    render(<CredentialDetailCard credential={view} />)

    await user.click(
      screen.getByRole('button', {
        name: /share credential/i,
      })
    )

    const dialog = await screen.findByRole('dialog', {
      name: /share national id card/i,
    })

    expect(dialog).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: /close/i,
      })
    )

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: /share national id card/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  it('moves from disclosure to QR and back again', async () => {
    const user = userEvent.setup()
    render(<CredentialDetailCard credential={view} />)
    await user.click(
      screen.getByRole('button', {
        name: /share credential/i,
      })
    )

    const dialog = await screen.findByRole('dialog', {
      name: /share national id card/i,
    })

    expect(
      within(dialog).getByText(/choose what to share/i)
    ).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: /generate qr code/i,
      })
    )

    expect(within(dialog).getByText(/qr-display-panel/i)).toBeInTheDocument()

    expect(
      within(dialog).getByRole('button', {
        name: /back-to-disclosure/i,
      })
    ).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', {
        name: /back-to-disclosure/i,
      })
    )

    await waitFor(() => {
      expect(
        within(dialog).getByText(/choose what to share/i)
      ).toBeInTheDocument()
    })
  })
})
