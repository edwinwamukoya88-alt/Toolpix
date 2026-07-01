export type Role = "admin" | "editor" | "viewer"

export interface AdminUser {
  email: string
  role: Role
}

export const ADMIN_USERS: AdminUser[] = [
  {
    email: "edwinwamukoya88@gmail.com",
    role: "admin",
  },
]

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_USERS.some((user) => user.email === email && user.role === "admin")
}

export function getUserRole(email: string | null | undefined): Role | null {
  if (!email) return null
  const user = ADMIN_USERS.find((u) => u.email === email)
  return user?.role ?? null
}
