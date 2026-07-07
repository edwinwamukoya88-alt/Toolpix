export type Role = "admin" | "editor" | "viewer"

export const ADMIN_USERS: { email: string; role: Role }[] = [
  { email: "edwinwamukoya88@gmail.com", role: "admin" },
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

export async function checkAdminRole(email: string | null | undefined): Promise<{ role: Role | null; isAdmin: boolean }> {
  if (!email) return { role: null, isAdmin: false }

  if (isAdmin(email)) {
    return { role: "admin", isAdmin: true }
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/admin/check-auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) return { role: null, isAdmin: false }
    return res.json()
  } catch {
    return { role: getUserRole(email), isAdmin: isAdmin(email) }
  }
}
