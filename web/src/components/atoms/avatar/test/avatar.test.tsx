import { render, screen } from '@testing-library/react'
import { Avatar } from '../avatar'

describe('Avatar', () => {
  it('renders initials', () => {
    render(<Avatar initials="TS" />)
    expect(screen.getByText('TS')).toBeInTheDocument()
  })
})
