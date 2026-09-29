import { render, screen } from '@testing-library/react'

import { StatusChecklistCard } from '../status-checklist-card'

describe('StatusChecklistCard', () => {
  it('renders the title and every item', () => {
    render(
      <StatusChecklistCard
        items={[
          { done: true, label: 'Citizen record found' },
          { done: false, label: "Driver's licence issued" },
        ]}
        title="Issuance Status"
      />
    )

    expect(screen.getByText('Issuance Status')).toBeInTheDocument()
    expect(screen.getByText('Citizen record found')).toBeInTheDocument()
    expect(screen.getByText("Driver's licence issued")).toBeInTheDocument()
  })
})
