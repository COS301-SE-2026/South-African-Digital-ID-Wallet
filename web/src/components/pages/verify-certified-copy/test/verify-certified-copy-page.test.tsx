import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { VerifyCertifiedCopyPage } from '../verify-certified-copy'

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
  InvalidCertifiedCopy: (_props: Record<string, never>) => (
    <div data-testid="invalid-certified-copy">
      Invalid certified copy
    </div>
  ),
}))
describe('VerifyCertifiedCopyPage', () => {
  it('renders the valid state when no status is supplied', async () => {
    const page = await VerifyCertifiedCopyPage({
      searchParams: Promise.resolve({}),
    })
    render(page)
    expect(screen.getByTestId('valid-certified-copy')).toBeInTheDocument()
  })
  it('renders the valid state for a valid status', async () => {
    const page = await VerifyCertifiedCopyPage({
      searchParams: Promise.resolve({ status: 'valid' }),
    })
    render(page)
    expect(screen.getByTestId('valid-certified-copy')).toBeInTheDocument()
  })
  it.each(['invalid', 'failed', 'fail', 'INVALID'])(
    'renders the invalid state for status "%s"',
    async (status) => {
      const page = await VerifyCertifiedCopyPage({
        searchParams: Promise.resolve({ status }),
      })
      render(page)
      expect(
        screen.getByTestId('invalid-certified-copy'),
      ).toBeInTheDocument()
    },
  )
  it('passes name and ID values to the valid state', async () => {
    const page = await VerifyCertifiedCopyPage({
      searchParams: Promise.resolve({
        status: 'valid',
        name: 'Thabo Mokoena',
        id: '8000 ••••••• 111',
      }),
    })
    render(page)
    expect(screen.getByText('Thabo Mokoena')).toBeInTheDocument()
    expect(screen.getByText('8000 ••••••• 111')).toBeInTheDocument()
  })
})