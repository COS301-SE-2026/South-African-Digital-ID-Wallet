import type { ImgHTMLAttributes, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { PublicCertifiedCopyFrame } from '../public-certified-copy-frame'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ''} />
  ),
}))
describe('PublicCertifiedCopyFrame', () => {
  it('renders its children', () => {
    render(
      <PublicCertifiedCopyFrame>
        <div>Certified copy content</div>
      </PublicCertifiedCopyFrame>
    )
    expect(screen.getByText('Certified copy content')).toBeInTheDocument()
  })
  it('renders the public verification footer', () => {
    render(
      <PublicCertifiedCopyFrame>
        <div>Content</div>
      </PublicCertifiedCopyFrame>
    )
    expect(screen.getByText('Powered by FlashID')).toBeInTheDocument()
    expect(screen.getByText('Prove yourself in a flash.')).toBeInTheDocument()
  })
  it('renders a main landmark', () => {
    render(
      <PublicCertifiedCopyFrame>
        <div>Content</div>
      </PublicCertifiedCopyFrame>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
