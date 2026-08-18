import { render, screen } from '@testing-library/react'
import { CitizenCell } from '../citizen-cell'

describe('CitizenCell', () => {
  it('renders initials, name, and ID number', () => {
    render(
      <CitizenCell
        initials="TS"
        name="Thabo Ndlovu"
        idNumber="860101 5385 088"
      />
    )
    expect(screen.getByText('Thabo Ndlovu')).toBeInTheDocument()
    expect(screen.getByText('860101 5385 088')).toBeInTheDocument()
    expect(screen.getByText('TS')).toBeInTheDocument()
  })
})
