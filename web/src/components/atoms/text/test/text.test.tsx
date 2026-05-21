import { render, screen } from '@testing-library/react'
import { Text } from '@/components/atoms'

describe('Text', () => {
  it('renders as a <p> by default', () => {
    render(<Text variant="sub-md">Hello</Text>)
    expect(screen.getByText('Hello').tagName).toBe('P')
  })

  it('renders as the element specified by the as prop', () => {
    render(
      <Text variant="h1" as="h1">
        Title
      </Text>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title')
  })

  it('applies data-cy attribute', () => {
    render(
      <Text variant="label" dataCy="my-label">
        Label
      </Text>
    )
    expect(screen.getByText('Label')).toHaveAttribute('data-cy', 'my-label')
  })
})
