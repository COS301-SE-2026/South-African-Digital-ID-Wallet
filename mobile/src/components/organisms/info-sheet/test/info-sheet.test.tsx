import { render, screen } from '@testing-library/react-native'

import { InfoSheet } from '../info-sheet'

const ITEMS = [
  {
    body: 'Your credentials never leave your device unencrypted.',
    title: 'Privacy',
  },
  { body: 'A body-only item with no heading.' },
]

describe('<InfoSheet/>', () => {
  it('Should render the sheet title and each item', async () => {
    await render(
      <InfoSheet
        isVisible
        items={ITEMS}
        onClose={jest.fn()}
        title="About FlashID"
      />
    )
    expect(screen.getByText('About FlashID')).toBeTruthy()
    expect(screen.getByText('Privacy')).toBeTruthy()
    expect(
      screen.getByText('Your credentials never leave your device unencrypted.')
    ).toBeTruthy()
  })
  it('Should render a body-only item without a heading', async () => {
    await render(
      <InfoSheet
        isVisible
        items={ITEMS}
        onClose={jest.fn()}
        title="About FlashID"
      />
    )
    expect(screen.getByText('A body-only item with no heading.')).toBeTruthy()
  })
})
