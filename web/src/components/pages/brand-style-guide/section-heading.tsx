export function SectionHeading({
  icon: Icon,
  children,
}: {
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon size={22} className="text-primary" />}
      <h2 className="font-heading text-[32px] leading-tight font-semibold text-foreground">
        {children}
      </h2>
    </div>
  )
}
