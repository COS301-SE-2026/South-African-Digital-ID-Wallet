export const CARD_HEIGHT = 188
export const CARD_PEEK = 104
export const COLLAPSED_PEEK = 18
export const SCROLL_STEP = CARD_PEEK - COLLAPSED_PEEK
export const FOCUS_GAP = CARD_HEIGHT - CARD_PEEK

export const focusedIndexFor = (offset: number, lastIndex: number): number =>
  Math.min(
    Math.max(Math.round(offset / SCROLL_STEP), 0),
    Math.max(lastIndex, 0)
  )
