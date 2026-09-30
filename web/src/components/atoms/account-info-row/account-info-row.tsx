import type { AccountInfoRowProps } from './types'

export const AccountInfoRow = ({
  label,
  value,
  border = true,
}: Readonly<AccountInfoRowProps>) => {
  return (
    <div
      className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-sm ${border ? 'border-b' : ''}`}
    >
      <span className="shrink-0 text-sm text-muted-text">{label}</span>
      <span className="min-w-0 text-right text-sm font-semibold [overflow-wrap:anywhere]">
        {value}
      </span>
    </div>
  )
}
