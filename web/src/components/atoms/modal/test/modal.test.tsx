import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../modal'

describe('Modal', () => {
  const onClose = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders its children when open', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders the close button', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when another key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies the provided data-cy attribute', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} dataCy="test-modal">
        <div>Modal content</div>
      </Modal>
    )
    expect(document.querySelector('[data-cy="test-modal"]')).toBeInTheDocument()
  })
})
