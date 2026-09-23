import { fireEvent, render, screen } from '@testing-library/react-native'

import type { WalletCredential } from '@/services'

import {
  CARD_HEIGHT,
  CARD_PEEK,
  COLLAPSED_PEEK,
  FOCUS_GAP,
  SCROLL_STEP,
  focusedIndexFor,
} from '../constants'
import { CredentialDeck } from '../credential-deck'

const credential = (id: string): WalletCredential => ({
  fields: [],
  id,
  isVerified: true,
  issuedBy: 'Department of Home Affairs',
  issuedOn: '02 Feb 2026',
  status: 'Active',
  title: `Credential ${id}`,
  tone: 'green',
  type: 'IdentityDocument',
})

const CREDENTIALS = [credential('c-1'), credential('c-2'), credential('c-3')]

describe('credential deck constants', () => {
  it('Should derive the scroll step from the peek sizes', () => {
    expect(SCROLL_STEP).toBe(CARD_PEEK - COLLAPSED_PEEK)
    expect(FOCUS_GAP).toBe(CARD_HEIGHT - CARD_PEEK)
  })
})

describe('focusedIndexFor', () => {
  it('Should focus the first card at the top', () => {
    expect(focusedIndexFor(0, 2)).toBe(0)
  })
  it('Should round to the nearest step', () => {
    expect(focusedIndexFor(SCROLL_STEP, 2)).toBe(1)
    expect(focusedIndexFor(SCROLL_STEP * 2, 2)).toBe(2)
  })
  it('Should clamp below zero', () => {
    expect(focusedIndexFor(-500, 2)).toBe(0)
  })
  it('Should clamp at the last index', () => {
    expect(focusedIndexFor(SCROLL_STEP * 99, 2)).toBe(2)
  })
  it('Should stay at zero for an empty deck', () => {
    expect(focusedIndexFor(SCROLL_STEP * 3, 0)).toBe(0)
  })
})

describe('<CredentialDeck/>', () => {
  it('Should render one card per credential', async () => {
    await render(
      <CredentialDeck credentials={CREDENTIALS} onSelect={jest.fn()} />
    )
    for (const item of CREDENTIALS) {
      expect(screen.getByTestId(`credential-card-${item.id}`)).toBeTruthy()
    }
  })
  it('Should select the focused card when it is pressed', async () => {
    const onSelect = jest.fn()
    await render(
      <CredentialDeck credentials={CREDENTIALS} onSelect={onSelect} />
    )
    await fireEvent.press(screen.getByTestId('credential-card-c-1'))
    expect(onSelect).toHaveBeenCalledWith(CREDENTIALS[0])
  })
  it('Should scroll to an unfocused card instead of selecting it', async () => {
    const onSelect = jest.fn()
    await render(
      <CredentialDeck credentials={CREDENTIALS} onSelect={onSelect} />
    )
    await fireEvent.press(screen.getByTestId('credential-card-c-3'))
    expect(onSelect).not.toHaveBeenCalled()
  })
  it('Should track the focused card as the deck scrolls', async () => {
    const onSelect = jest.fn()
    await render(
      <CredentialDeck credentials={CREDENTIALS} onSelect={onSelect} />
    )
    await fireEvent.scroll(screen.getByTestId('credential-deck-scroll'), {
      nativeEvent: {
        contentOffset: { x: 0, y: SCROLL_STEP },
        contentSize: { height: 1000, width: 390 },
        layoutMeasurement: { height: 600, width: 390 },
      },
    })
    await fireEvent.press(screen.getByTestId('credential-card-c-2'))
    expect(onSelect).toHaveBeenCalledWith(CREDENTIALS[1])
  })
  it('Should measure its viewport on layout', async () => {
    await render(
      <CredentialDeck credentials={CREDENTIALS} onSelect={jest.fn()} />
    )
    await fireEvent(screen.getByTestId('credential-deck'), 'layout', {
      nativeEvent: { layout: { height: 600, width: 390 } },
    })
    expect(screen.getByTestId('credential-deck')).toBeTruthy()
  })
  it('Should render an empty deck without crashing', async () => {
    await render(<CredentialDeck credentials={[]} onSelect={jest.fn()} />)
    expect(screen.getByTestId('credential-deck')).toBeTruthy()
  })
})
