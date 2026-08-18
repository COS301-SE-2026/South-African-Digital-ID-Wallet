import { render, screen } from '@testing-library/react'
import { ShieldCheck } from 'lucide-react'
import { StatCard } from '../stat-card'

describe('StatCard', () => {
  it('renders label, value, and subtext', () => {
    render(
      <StatCard
        icon={ShieldCheck}
        tone="green"
        label="Active Credentials"
        value="231,842"
        subtext="93.3% of total"
      />
    )

    expect(screen.getByText('Active Credentials')).toBeInTheDocument()
    expect(screen.getByText('231,842')).toBeInTheDocument()
    expect(screen.getByText('93.3% of total')).toBeInTheDocument()
  })

  it('applies tone-specific styling without crashing for each tone', () => {
    const tones = ['green', 'gold', 'red', 'neutral'] as const

    tones.forEach((tone) => {
      const { unmount } = render(
        <StatCard
          icon={ShieldCheck}
          tone={tone}
          label="Label"
          value={1}
          subtext="Subtext"
        />
      )
      expect(screen.getByText('Label')).toBeInTheDocument()
      unmount()
    })
  })
})
