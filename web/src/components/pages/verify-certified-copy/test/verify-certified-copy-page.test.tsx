import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { VerifyCertifiedCopyPage } from '../verify-certified-copy'
import certifiedCopyService from '@/services/certified-copy-service/certified-copy-service'

jest.mock('@/services/certified-copy-service/certified-copy-service', () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}))

jest.mock('@/components/organisms/valid-certified-copy', () => ({
  ValidCertifiedCopy: ({
    citizenName,
    maskedId,
  }: {
    citizenName?: string
    maskedId?: string
  }) => (
    <div data-testid="valid-certified-copy">
      <span>{citizenName}</span>
      <span>{maskedId}</span>
    </div>
  ),
}))

jest.mock('@/components/organisms/invalid-certified-copy', () => ({
  InvalidCertifiedCopy: () => (
    <div data-testid="invalid-certified-copy">Invalid certified copy</div>
  ),
}))

describe('VerifyCertifiedCopyPage', () => {
  const mockVerify = certifiedCopyService.verify as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the valid state when the backend verifies the token', async () => {
    mockVerify.mockResolvedValue({
      isValid: true,
      fullName: 'Thabo Mokoena',
      idNumber: '8000 ••••••• 111',
    })
    const page = await VerifyCertifiedCopyPage({
      verificationToken: 'valid-token',
    })
    render(page)

    expect(mockVerify).toHaveBeenCalledWith('valid-token')
    expect(screen.getByTestId('valid-certified-copy')).toBeInTheDocument()
    expect(screen.getByText('Thabo Mokoena')).toBeInTheDocument()
    expect(screen.getByText('8000 ••••••• 111')).toBeInTheDocument()
  })

  it('renders the invalid state when verification fails', async () => {
    mockVerify.mockRejectedValue(new Error('Verification failed'))

    const page = await VerifyCertifiedCopyPage({
      verificationToken: 'failed-token',
    })

    render(page)

    expect(mockVerify).toHaveBeenCalledWith('failed-token')
    expect(screen.getByTestId('invalid-certified-copy')).toBeInTheDocument()
  })
})
