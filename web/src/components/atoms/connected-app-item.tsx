type ConnectedAppItemProps = {
  name: string
  subtitle?: string
  status?: 'active' | 'inactive'
}

export const ConnectedAppItem = ({
  name,
  subtitle,
  status = 'active',
}: Readonly<ConnectedAppItemProps>) => {
  return (
    <div className="border rounded-2xl p-5 flex justify-between items-center">
      <div>
        <p className="font-semibold">{name}</p>
        {subtitle && <p className="text-muted-text text-sm">{subtitle}</p>}
      </div>

      <span
        className={`px-4 py-1 rounded-full text-sm font-semibold ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}
      >
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    </div>
  )
}
