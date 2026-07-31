import { render, screen } from '@testing-library/react'
import { ScanResultCard } from '../scan-result-card'
import { Signature } from 'lucide-react'

describe('ScanResultCard', () => {
  it('renders the credential type badge and disclosed field values as text', () => {
    render(
      <ScanResultCard
        credentialType="Identity Document"
        disclosedFields={{ 'SA ID number': '9001015800083' }}
      />
    )

    expect(screen.getByText('Verified credentials')).toBeInTheDocument()
    expect(screen.getByText('Identity Document')).toBeInTheDocument()
    expect(screen.getByText('SA ID number')).toBeInTheDocument()
    expect(screen.getByText('9001015800083')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders an image for a photo field when a value is present', () => {
    render(
      <ScanResultCard
        credentialType="Identity Document"
        disclosedFields={{ Photo: 'https://example.com/photo.png' }}
      />
    )

    const image = screen.getByRole('img', { name: 'Photo' })

    expect(image).toHaveAttribute('src', 'https://example.com/photo.png')
  })

  it('renders an image for a signature field when a value is present', () => {
    render(
      <ScanResultCard
        credentialType="Identity Document"
        disclosedFields={{ Signature: 'https://example.com/signature.png' }}
      />
    )

    const image = screen.getByRole('img', { name: 'Signature' })

    expect(image).toHaveAttribute('src', 'https://example.com/signature.png')
  })

  it('falls back to text when a photo field has no value', () => {
    render(
      <ScanResultCard
        credentialType="Identity Document"
        disclosedFields={{ Photograph: '' }}
      />
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Photograph')).toBeInTheDocument()
  })
})
