export type AppUser = {
  names?: string
  surname?: string
  userId?: string | number
  citizenship?: string
  memberSince?: string
}

export type AccountCardProps = {
  readonly user: AppUser | null
}
