export const ReadyItem = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
        <Icon className="h-5 w-5 text-green-700" />
      </div>

      <div>
        <p className="text-sm font-semibold">{title} </p>
        <p className="text-sm text-muted-foreground">{description} </p>
      </div>
    </div>
  )
}

export default ReadyItem
