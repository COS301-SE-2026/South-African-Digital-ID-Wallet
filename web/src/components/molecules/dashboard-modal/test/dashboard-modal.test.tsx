import { fireEvent, render, screen } from '@testing-library/react'
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
  it('renders with dialog accessibility attributes', () => {
    render(
      <DashboardModal open title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )
    expect(
      screen.getByRole('dialog', {
        name: 'Test Modal',
      })
    ).toBeInTheDocument()
  })
  it('calls onClose when the footer Close button is clicked', () => {
    render(
      <DashboardModal open title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('calls onClose when the close icon is clicked', () => {
    render(
      <DashboardModal open title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('calls onClose when Escape is pressed', () => {
    render(
      <DashboardModal open title="Test Modal" onClose={onClose}>
        <p>Modal Content</p>
      </DashboardModal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('hides the footer Close button when showBottomClose is false', () => {
    render(
      <DashboardModal
        open
        title="Test Modal"
        onClose={onClose}
        showBottomClose={false}
      >
        <p>Modal Content</p>
      </DashboardModal>
    )
    expect(
      screen.queryByRole('button', { name: 'Close' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Close dialog' })
    ).toBeInTheDocument()
  })
})
