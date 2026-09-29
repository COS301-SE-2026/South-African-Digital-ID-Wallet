import { render, screen } from '@testing-library/react'
import { CertifiedCopyVerificationProgress } from '../certified-copy-verification-progress'

describe('CertifiedCopyVerificationProgress', () => {
  it('renders the verification heading and description', () => {
    render(<CertifiedCopyVerificationProgress currentStep={3} />)
    expect(
      screen.getByRole('heading', { name: 'Verifying Document' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Please wait while the certified copy is checked.')
    ).toBeInTheDocument()
  })
  it('renders all verification steps', () => {
    render(<CertifiedCopyVerificationProgress currentStep={3} />)
    expect(screen.getByText('Uploading document')).toBeInTheDocument()
    expect(
      screen.getByText('Extracting verification reference')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Verifying certification record')
    ).toBeInTheDocument()
    expect(screen.getByText('Checking document integrity')).toBeInTheDocument()
    expect(
      screen.getByText('Retrieving credential details')
    ).toBeInTheDocument()
  })
  it('renders completed, active, and pending steps', () => {
    render(<CertifiedCopyVerificationProgress currentStep={3} />)
    const completedStep = screen.getByText('Uploading document').closest('li')
    const activeStep = screen
      .getByText('Verifying certification record')
      .closest('li')
    const pendingStep = screen
      .getByText('Retrieving credential details')
      .closest('li')
    expect(completedStep).toHaveClass('relative')
    expect(activeStep).toHaveClass('relative')
    expect(pendingStep).toHaveClass('relative')
    expect(completedStep?.querySelector('svg')).toBeInTheDocument()
    expect(activeStep?.querySelector('.animate-spin')).toBeInTheDocument()
  })
  it('renders the informational message', () => {
    render(<CertifiedCopyVerificationProgress currentStep={5} />)
    expect(
      screen.getByText(
        'This usually takes a few seconds. Please do not close this window.'
      )
    ).toBeInTheDocument()
  })
})
