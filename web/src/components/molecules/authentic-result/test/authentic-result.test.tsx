import { fireEvent, render, screen } from '@testing-library/react'
import { AuthenticResult } from '../authentic-result'
import type { VerifyCertifiedCopyDocumentResponse } from '@/services/certified-copy-service/types'

const result: VerifyCertifiedCopyDocumentResponse = {
  isValid: true,
  documentIntegrityValid: true,
  status: 'Valid',
  certificationId: 'cert-123',
  credentialType: 'IdentityDocument',
  fullName: 'Test Citizen',
  idNumber: '9001015009087',
  generatedAt: '2026-10-19T10:30:00Z',
  expiresAt: null,
  message: 'Valid',
}
const show = (overrides: Partial<typeof result> = {}) =>
  render(
    <AuthenticResult
      result={{ ...result, ...overrides }}
      onVerifyAnotherDocument={jest.fn()}
    />
  )

describe('AuthenticResult', () => {
  it('shows verification details without exposing the full identity number', () => {
    show()
    expect(
      screen.getByRole('heading', { name: 'Document Authentic' })
    ).toBeInTheDocument()
    expect(screen.getByText('Test Citizen')).toBeInTheDocument()
    expect(screen.getByText('cert-123')).toBeInTheDocument()
    expect(screen.getByText('***********87')).toBeInTheDocument()
    expect(screen.queryByText(result.idNumber)).not.toBeInTheDocument()
    expect(
      screen.getByText(
        new Intl.DateTimeFormat('en-ZA', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(result.generatedAt))
      )
    ).toBeInTheDocument()
  })
  it.each([
    ['IdentityDocument', 'South African Identity Document'],
    ['DriversLicense', "South African Driver's Licence"],
    ['Passport', 'Passport'],
    ['', 'Certified Credential'],
  ])('formats credential type %s', (credentialType, label) => {
    show({ credentialType })
    expect(screen.getByText(label)).toBeInTheDocument()
  })
  it('provides placeholders for missing identity and generation date', () => {
    show({ idNumber: '', generatedAt: '' })
    expect(screen.getAllByText('Not available')).toHaveLength(2)
  })
  it.each(['7', '87'])(
    'handles short identity values without a negative mask length: %s',
    (idNumber) => {
      show({ idNumber })
      expect(screen.getByText(idNumber)).toBeInTheDocument()
    }
  )
  it('starts another verification only when requested', () => {
    const onVerifyAnotherDocument = jest.fn()
    render(
      <AuthenticResult
        result={result}
        onVerifyAnotherDocument={onVerifyAnotherDocument}
      />
    )
    expect(onVerifyAnotherDocument).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getByRole('button', { name: 'Verify Another Document' })
    )
    expect(onVerifyAnotherDocument).toHaveBeenCalledTimes(1)
  })
})
