import { fireEvent, render, screen } from '@testing-library/react-native'

import { AuditLogFilterSheet } from '../audit-log-filter-sheet'

const ACTIONS = ['UserLoggedIn', 'CredentialShared']

describe('<AuditLogFilterSheet/>', () => {
  it('Should humanize each action into an option', async () => {
    await render(
      <AuditLogFilterSheet
        actions={ACTIONS}
        isVisible
        onClose={jest.fn()}
        onSelect={jest.fn()}
      />
    )
    expect(screen.getByText('All actions')).toBeTruthy()
    expect(screen.getByText('User logged in')).toBeTruthy()
    expect(screen.getByText('Credential shared')).toBeTruthy()
  })
  it('Should select "all" when no action is set', async () => {
    await render(
      <AuditLogFilterSheet
        actions={ACTIONS}
        isVisible
        onClose={jest.fn()}
        onSelect={jest.fn()}
      />
    )
    expect(
      screen.getByTestId('audit-log-filter-sheet-all').props.accessibilityState
        .selected
    ).toBe(true)
  })
  it('Should mark the active action as selected', async () => {
    await render(
      <AuditLogFilterSheet
        action="UserLoggedIn"
        actions={ACTIONS}
        isVisible
        onClose={jest.fn()}
        onSelect={jest.fn()}
      />
    )
    expect(
      screen.getByTestId('audit-log-filter-sheet-UserLoggedIn').props
        .accessibilityState.selected
    ).toBe(true)
  })
  it('Should emit the chosen action and close', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    await render(
      <AuditLogFilterSheet
        actions={ACTIONS}
        isVisible
        onClose={onClose}
        onSelect={onSelect}
      />
    )
    await fireEvent.press(
      screen.getByTestId('audit-log-filter-sheet-CredentialShared')
    )
    expect(onSelect).toHaveBeenCalledWith('CredentialShared')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('Should emit undefined when "all actions" is chosen', async () => {
    const onSelect = jest.fn()
    await render(
      <AuditLogFilterSheet
        action="UserLoggedIn"
        actions={ACTIONS}
        isVisible
        onClose={jest.fn()}
        onSelect={onSelect}
      />
    )
    await fireEvent.press(screen.getByTestId('audit-log-filter-sheet-all'))
    expect(onSelect).toHaveBeenCalledWith(undefined)
  })
})
