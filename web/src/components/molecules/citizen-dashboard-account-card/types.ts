export interface AppUser {
  userId: string
  saId: string
  names: string
  surname: string
  citizenship: string
}

export type AccountCardProps = {
  readonly user: AppUser | null
}
