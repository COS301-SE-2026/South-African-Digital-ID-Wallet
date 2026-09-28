import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { InvalidCertifiedCopy } from '../invalid-certified-copy'

jest.mock('@/components/organisms/public-certified-copy-frame', () => ({
  PublicCertifiedCopyFrame: ({
    children,
  }: {
    children: ReactNode
  }) => <>{children}</>,
}))
describe('InvalidCertifiedCopy', () => {
  it('renders the invalid certified-copy state', () => {
    render(<InvalidCertifiedCopy />)
    expect(
      screen.getByRole('heading', { name: 'Certified Copy Invalid' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'This certified copy could not be verified or is no longer valid.',
      ),
    ).toBeInTheDocument()
  })
  it('renders the invalid-copy warning', () => {
    render(<InvalidCertifiedCopy />)
    expect(
      screen.getByText('This certified copy is not valid.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Please do not rely on this copy as a trusted version of the credential.',
      ),
    ).toBeInTheDocument()
  })
})