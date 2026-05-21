import { render, screen } from '@testing-library/react'

import { AccountInfoRow } from '@/components/atoms'

describe('AccountInfoRow', () => {
  it('renders label and value', () => {
    render(<AccountInfoRow label="Name" value="Jane Doe" />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('omits the border class when border is false', () => {
    render(<AccountInfoRow label="Name" value="Jane Doe" border={false} />)

    expect(screen.getByText('Name').closest('div')).not.toHaveClass('border-b')
  })
})
