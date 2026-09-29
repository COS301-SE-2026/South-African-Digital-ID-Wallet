import { render, screen } from '@testing-library/react'

import { ProgressStepper } from '@/components/molecules'

describe('ProgressStepper', () => {
  it('Should render every step label and it should not be limited to only 3 steps', () => {
    const steps = ['One', 'Two', 'Three', 'Four', 'Five']
    render(<ProgressStepper steps={steps} currentStep={1} />)

    steps.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
    expect(screen.getAllByRole('listitem')).toHaveLength(steps.length)
  })

  it('Should mark the current step with its properties', () => {
    render(<ProgressStepper steps={['A', 'B', 'C']} currentStep={2} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).not.toHaveAttribute('aria-current')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[2]).not.toHaveAttribute('aria-current')
  })

  it('Should show the numbers for the active and ongoing steps and with check for completed ones', () => {
    render(<ProgressStepper steps={['A', 'B', 'C']} currentStep={2} />)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('Should show progress list', () => {
    render(<ProgressStepper steps={['A', 'B']} currentStep={1} />)
    expect(screen.getByRole('list', { name: 'Progress' })).toBeInTheDocument()
  })
})
