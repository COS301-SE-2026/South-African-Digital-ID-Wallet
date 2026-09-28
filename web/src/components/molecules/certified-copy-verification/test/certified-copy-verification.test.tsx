import { render, screen } from '@testing-library/react'

import { CertifiedCopyVerification } from '../certified-copy-verification'

jest.mock('../../certified-copy-verification-progress', () => ({
  CertifiedCopyVerificationProgress: ({
    currentStep,
  }: {
    currentStep: number
  }) => <div>Progress step {currentStep}</div>,
}))

jest.mock('../../authentic-result', () => ({
  AuthenticResult: ({
    onViewCredentialDetails,
    onVerifyAnotherDocument,
  }: {
    onViewCredentialDetails: () => void
    onVerifyAnotherDocument: () => void
  }) => (
    <div>
      <div>Authentic result</div>
      <button onClick={onViewCredentialDetails}>
        View credential details
      </button>
      <button onClick={onVerifyAnotherDocument}>
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
      <button onClick={onVerifyAnotherDocument}>
        Verify another document
      </button>
      <button onClick={onContactSupport}>Contact support</button>
    </div>
  ),
}))

describe('CertifiedCopyVerification', () => {
  const defaultProps = {
    currentStep: 3,
    onViewCredentialDetails: jest.fn(),
    onVerifyAnotherDocument: jest.fn(),
    onContactSupport: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the progress state', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="progress"
      />,
    )

    expect(screen.getByText('Progress step 3')).toBeInTheDocument()
  })

  it('renders the authentic state', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="authentic"
      />,
    )

    expect(screen.getByText('Authentic result')).toBeInTheDocument()
  })

  it('renders the failed state', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="failed"
      />,
    )

    expect(
      screen.getByText('Integrity failed result'),
    ).toBeInTheDocument()
  })

  it('passes authentic-result actions correctly', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="authentic"
      />,
    )

    screen.getByRole('button', {
      name: 'View credential details',
    }).click()

    screen.getByRole('button', {
      name: 'Verify another document',
    }).click()

    expect(
      defaultProps.onViewCredentialDetails,
    ).toHaveBeenCalledTimes(1)

    expect(
      defaultProps.onVerifyAnotherDocument,
    ).toHaveBeenCalledTimes(1)
  })

  it('passes failed-result actions correctly', () => {
    render(
      <CertifiedCopyVerification
        {...defaultProps}
        state="failed"
      />,
    )

    screen.getByRole('button', {
      name: 'Verify another document',
    }).click()

    screen.getByRole('button', {
      name: 'Contact support',
    }).click()

    expect(
      defaultProps.onVerifyAnotherDocument,
    ).toHaveBeenCalledTimes(1)

    expect(defaultProps.onContactSupport).toHaveBeenCalledTimes(1)
  })
})