import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardModal } from '../dashboard-modal'

describe('DashboardModal', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
  })

  it('does not render when open is false', () => {
    render(
      <DashboardModal open={false} title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    render(
      <DashboardModal open={true} title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('calls onClose when the Close button is clicked', () => {
    render(
      <DashboardModal open={true} title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the X button is clicked', () => {
    render(
      <DashboardModal open={true} title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )

    const buttons = screen.getAllByRole('button')

    fireEvent.click(buttons[0])

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
