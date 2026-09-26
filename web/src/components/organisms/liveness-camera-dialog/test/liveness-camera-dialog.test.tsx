import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LivenessCameraDialog } from '../liveness-camera-dialog'

jest.mock('@azure/ai-vision-face-ui', () => ({}), { virtual: true })
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))
const mockCreateElement = (impl: (tagName: string) => HTMLElement) => {
  const realCreateElement = document.createElement.bind(document)
  jest
    .spyOn(document, 'createElement')
    .mockImplementation(
      ((tagName: string) => impl(tagName) ?? realCreateElement(tagName)) as any
    )
}
describe('LivenessCameraDialog', () => {
  const originalWhenDefined = customElements.whenDefined
  beforeEach(() => {
    customElements.whenDefined = jest.fn().mockResolvedValue(undefined)
  })
  afterEach(() => {
    customElements.whenDefined = originalWhenDefined
    jest.restoreAllMocks()
  })
  it('renders nothing when open is false', () => {
    const { container } = render(
      <LivenessCameraDialog
        open={false}
        authToken="token"
        onOpenChange={jest.fn()}
        onComplete={jest.fn()}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('starts the detector and calls onComplete on success', async () => {
    const start = jest.fn().mockResolvedValue(undefined)
    const realCreateElement = document.createElement.bind(document)
    mockCreateElement((tagName) => {
      if (tagName === 'azure-ai-vision-face-ui') {
        return Object.assign(realCreateElement('div'), { start })
      }
      return realCreateElement(tagName)
    })
    const onComplete = jest.fn()
    render(
      <LivenessCameraDialog
        open
        authToken="token-123"
        onOpenChange={jest.fn()}
        onComplete={onComplete}
      />
    )
    expect(screen.getByText(/preparing secure camera/i)).toBeInTheDocument()
    await act(async () => {
      await flushPromises()
    })
    await waitFor(() => expect(start).toHaveBeenCalledWith('token-123'))
    await waitFor(() => expect(onComplete).toHaveBeenCalled())
  })

  it('shows an error message and calls onError when the detector fails to initialise', async () => {
    const realCreateElement = document.createElement.bind(document)
    mockCreateElement((tagName) => {
      if (tagName === 'azure-ai-vision-face-ui') {
        return realCreateElement('div')
      }
      return realCreateElement(tagName)
    })
    const onError = jest.fn()
    render(
      <LivenessCameraDialog
        open
        authToken="token-123"
        onOpenChange={jest.fn()}
        onComplete={jest.fn()}
        onError={onError}
      />
    )
    await act(async () => {
      await flushPromises()
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /did not initialise correctly/i
    )
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('did not initialise correctly')
    )
  })
  it('calls onOpenChange when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(
      <LivenessCameraDialog
        open
        authToken="token-123"
        onOpenChange={onOpenChange}
        onComplete={jest.fn()}
      />
    )
    await user.click(
      screen.getByRole('button', { name: /close verification/i })
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
