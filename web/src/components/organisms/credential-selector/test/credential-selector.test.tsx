import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CredentialSelector } from '../credential-selector'
import { qrService } from '@/services/qr-service'

jest.mock('@/services/qr-service', () => ({
  qrService: {
    getMine: jest.fn(),
  },
}))

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('CredentialSelector', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows a loading state initially', () => {
    ;(qrService.getMine as jest.Mock).mockReturnValue(new Promise(() => {}))
    renderWithClient(<CredentialSelector onSelect={() => {}} />)
    expect(screen.getByText(/loading your credentials/i)).toBeInTheDocument()
  })

  it('shows credentials once loaded', async () => {
    ;(qrService.getMine as jest.Mock).mockResolvedValue([
      { id: 'credential-1', credentialType: 'Identity Document' },
    ])
    renderWithClient(<CredentialSelector onSelect={() => {}} />)
    await waitFor(() => {
      expect(screen.getByText('Identity Document')).toBeInTheDocument()
    })
  })

  it('shows an empty state when there are no credentials', async () => {
    ;(qrService.getMine as jest.Mock).mockResolvedValue([])
    renderWithClient(<CredentialSelector onSelect={() => {}} />)
    await waitFor(() => {
      expect(
        screen.getByText(/don't have any active credentials/i)
      ).toBeInTheDocument()
    })
  })

  it('shows an error state when the request fails', async () => {
    ;(qrService.getMine as jest.Mock).mockRejectedValue(new Error('failed'))
    renderWithClient(<CredentialSelector onSelect={() => {}} />)
    await waitFor(() => {
      expect(
        screen.getByText(/could not load your credentials/i)
      ).toBeInTheDocument()
    })
  })

  it('calls onSelect with credential id and mapped type when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    ;(qrService.getMine as jest.Mock).mockResolvedValue([
      { id: 'credential-1', credentialType: 'Identity Document' },
    ])
    renderWithClient(<CredentialSelector onSelect={onSelect} />)
    await waitFor(() => {
      expect(screen.getByText('Identity Document')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Identity Document'))
    expect(onSelect).toHaveBeenCalledWith('credential-1', 'identityDocument')
  })
})
