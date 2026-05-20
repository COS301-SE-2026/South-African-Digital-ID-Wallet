import type { AccountInfoRowProps } from '@/types/account-info-row'

export const AccountInfoRow = ({
  label,
  value,
  border = true,
}: Readonly<AccountInfoRowProps>) => {
  return (
    <div
      className={`flex justify-between px-4 py-3 text-sm ${border ? 'border-b' : ''}`}
    >
      <span className="text-sm text-muted-text">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  )
}
