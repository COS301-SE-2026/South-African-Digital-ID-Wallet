import { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import {
  credentialService,
  type CredentialResponse,
} from '@/services/credential-service'

import { CredentialsList } from '../credentials-list'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

const credentialsTemp: CredentialResponse[] = [
  {
    id: 'id-1',
    type: 'IdentityDocument',
    title: 'National ID Card',
    issuedBy: 'Department of Home Affairs',
    status: 'Active',
    issueDate: '2024-02-12T00:00:00Z',
    identityDocument: {
      idNumber: '0001010001088',
      nationality: 'South African',
      citizenship: 'South African',
      countryOfBirth: 'South Africa',
      status: 'Citizen',
    },
    driversLicense: null,
  },
  {
    id: 'dl-1',
    type: 'DriversLicense',
    title: "Driver's Licence",
    issuedBy: 'Road Traffic Manager Provider of Licence of Car',
    status: 'Active',
    issueDate: '2024-02-12T00:00:00Z',
    identityDocument: null,
    driversLicense: {
      licenseNumber: 'DL12345',
      licenseCode: 'B',
      restrictions: '',
      expiryDate: '2029-02-12T00:00:00Z',
    },
  },
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

describe('CredentialsList', () => {
  beforeEach(() => {
    jest.spyOn(credentialService, 'getMine').mockResolvedValue(credentialsTemp)
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })
  it('Just renders the credential list heading', () => {
    render(<CredentialsList />, { wrapper: createWrapper() })
    expect(
      screen.getByRole('heading', { name: /credential list/i })
    ).toBeInTheDocument()
  })
  it('Just renders all credentials', async () => {
    render(<CredentialsList />, { wrapper: createWrapper() })
    expect(await screen.findByText(/national id card/i)).toBeInTheDocument()
    expect(await screen.findByText(/driver's licence/i)).toBeInTheDocument()
  })
  it('Just renders the credential issuers', async () => {
    render(<CredentialsList />, { wrapper: createWrapper() })
    expect(
      await screen.findByText(/department of home affairs/i)
    ).toBeInTheDocument()
    expect(await screen.findByText(/road traffic manager/i)).toBeInTheDocument()
  })
  it('Just renders a view credential button for each credential', async () => {
    render(<CredentialsList />, { wrapper: createWrapper() })
    expect(
      await screen.findAllByRole('button', { name: /view credential/i })
    ).toHaveLength(2)
  })
})
