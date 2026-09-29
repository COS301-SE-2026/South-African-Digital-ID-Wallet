import { fireEvent, render, screen } from '@testing-library/react'
import { CertifiedCopyVerification } from '../certified-copy-verification'
import type { VerifyCertifiedCopyDocumentResponse } from '@/services/certified-copy-service/types'

jest.mock('../../certified-copy-verification-progress', () => ({
  CertifiedCopyVerificationProgress: ({
    currentStep,
  }: {
    currentStep: number
  }) => <div>Verification progress step {currentStep}</div>,
}))

jest.mock('../../authentic-result', () => ({
  AuthenticResult: ({
    result,
    onVerifyAnotherDocument,
  }: {
    result: VerifyCertifiedCopyDocumentResponse
    onVerifyAnotherDocument: () => void
  }) => (
    <div>
      <div>Authentic result</div>
      <div>{result.fullName}</div>
      <div>{result.credentialType}</div>
      <div>{result.certificationId}</div>
      <button type="button" onClick={onVerifyAnotherDocument}>
        Verify another document
      </button>
    </div>
  ),
}))

jest.mock('../../integrity-failed-result', () => ({
  IntegrityFailedResult: ({
    onVerifyAnotherDocument,
    onContactSupport,
  }: {
    onVerifyAnotherDocument: () => void
    onContactSupport: () => void
  }) => (
    <div>
      <div>Integrity failed result</div>
      <button type="button" onClick={onVerifyAnotherDocument}>
        Verify another document
      </button>
      <button type="button" onClick={onContactSupport}>
        Contact support
      </button>
    </div>
  ),
}))

const mockVerificationResult: VerifyCertifiedCopyDocumentResponse = {
  isValid: true,
  documentIntegrityValid: true,
  status: 'Active',
  certificationId: '9e775648-6a13-424b-bf30-cc90038b3e93',
  credentialType: 'DriversLicense',
  fullName: 'Kayla Patel',
  idNumber: '9000000000000',
  generatedAt: '2026-09-29T00:09:00Z',
  expiresAt: null,
  message: 'Certified copy verified successfully.',
}

describe('CertifiedCopyVerification', () => {
  const defaultProps = {
    state: 'progress' as const,
    currentStep: 3,
    result: mockVerificationResult,
    onViewCredentialDetails: jest.fn(),
    onVerifyAnotherDocument: jest.fn(),
    onContactSupport: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the verification progress state', () => {
    render(<CertifiedCopyVerification {...defaultProps} state="progress" />)

    expect(screen.getByText('Verification progress step 3')).toBeInTheDocument()
    expect(screen.queryByText('Authentic result')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Integrity failed result')
    ).not.toBeInTheDocument()
  })

  it('passes the current step to the progress component', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="progress"
        currentStep={5}
      />
    )

    expect(screen.getByText('Verification progress step 5')).toBeInTheDocument()
  })

  it('passes the verified document result to the authentic result', () => {
    render(<CertifiedCopyVerification {...defaultProps} state="authentic" />)

    expect(screen.getByText('Kayla Patel')).toBeInTheDocument()
    expect(screen.getByText('DriversLicense')).toBeInTheDocument()
    expect(
      screen.getByText('9e775648-6a13-424b-bf30-cc90038b3e93')
    ).toBeInTheDocument()
  })

  it('does not render the authentic state when verification data is missing', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="authentic"
        result={null}
      />
    )

    expect(screen.queryByText('Authentic result')).not.toBeInTheDocument()
    expect(screen.getByText('Integrity failed result')).toBeInTheDocument()
  })

  it('renders the authentic state when verification data is available', () => {
    render(<CertifiedCopyVerification {...defaultProps} state="authentic" />)

    expect(screen.getByText('Authentic result')).toBeInTheDocument()
    expect(
      screen.queryByText('Integrity failed result')
    ).not.toBeInTheDocument()
  })

  it('renders the failed state', () => {
    render(<CertifiedCopyVerification {...defaultProps} state="failed" />)

    expect(screen.getByText('Integrity failed result')).toBeInTheDocument()
  })

  it('passes failed-result actions correctly', () => {
    render(<CertifiedCopyVerification {...defaultProps} state="failed" />)

    screen
      .getByRole('button', {
        name: 'Verify another document',
      })
      .click()

    screen
      .getByRole('button', {
        name: 'Contact support',
      })
      .click()

    expect(defaultProps.onVerifyAnotherDocument).toHaveBeenCalledTimes(1)

    expect(defaultProps.onContactSupport).toHaveBeenCalledTimes(1)
  })
})
