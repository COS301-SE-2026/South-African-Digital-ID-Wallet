export type RowAction = {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

export type RowActionsMenuProps = {
  actions: RowAction[]
}
