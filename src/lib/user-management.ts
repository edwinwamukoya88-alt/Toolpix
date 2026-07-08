const API = "/api/admin/users"

export interface AdminUserRecord {
  email: string
  role: string
  status: string
  lastLogin?: string
  invitedAt: number
}

async function fetchAll(): Promise<AdminUserRecord[]> {
  try {
    const res = await fetch(API)
    if (!res.ok) return []
    const data = await res.json()
    return data.map((u: any) => ({
      email: u.email,
      role: u.role,
      status: u.status,
      lastLogin: u.lastLogin ?? undefined,
      invitedAt: new Date(u.invitedAt).getTime(),
    }))
  } catch {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("zil_admin_invites")
        const invites: AdminUserRecord[] = raw ? JSON.parse(raw) : []
        return [
          { email: "edwinwamukoya88@gmail.com", role: "admin", status: "active", invitedAt: 0 },
          ...invites,
        ].sort((a, b) => a.email.localeCompare(b.email))
      }
    } catch {}
    return [{ email: "edwinwamukoya88@gmail.com", role: "admin", status: "active", invitedAt: 0 }]
  }
}

function defaultUsers(): AdminUserRecord[] {
  return [{ email: "edwinwamukoya88@gmail.com", role: "admin", status: "active", invitedAt: 0 }]
}

export async function getAllAdminUsers(): Promise<AdminUserRecord[]> {
  return fetchAll()
}

export async function inviteAdmin(email: string, role: string): Promise<AdminUserRecord | null> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    })
    if (res.ok) return { email, role, status: "invited", invitedAt: Date.now() }
  } catch {}
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_admin_invites")
      const invites: AdminUserRecord[] = raw ? JSON.parse(raw) : []
      const existing = invites.find((i) => i.email === email)
      if (existing) {
        existing.role = role
        existing.status = "invited"
      } else {
        invites.push({ email, role, status: "invited", invitedAt: Date.now() })
      }
      localStorage.setItem("zil_admin_invites", JSON.stringify(invites))
    }
  } catch {}
  return { email, role, status: "invited", invitedAt: Date.now() }
}

export async function removeAdmin(email: string): Promise<boolean> {
  if (email === "edwinwamukoya88@gmail.com") return false
  try {
    const res = await fetch(API, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (res.ok) return true
  } catch {}
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_admin_invites")
      const invites: AdminUserRecord[] = raw ? JSON.parse(raw) : []
      const filtered = invites.filter((i) => i.email !== email)
      if (filtered.length === invites.length) return false
      localStorage.setItem("zil_admin_invites", JSON.stringify(filtered))
      return true
    }
  } catch {}
  return false
}

export async function updateAdminRole(email: string, role: string): Promise<boolean> {
  try {
    const res = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    })
    if (res.ok) return true
  } catch {}
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_admin_invites")
      const invites: AdminUserRecord[] = raw ? JSON.parse(raw) : []
      const invite = invites.find((i) => i.email === email)
      if (invite) {
        invite.role = role
      } else {
        invites.push({ email, role, status: "active", invitedAt: 0 })
      }
      localStorage.setItem("zil_admin_invites", JSON.stringify(invites))
    }
  } catch {}
  return true
}

export async function setAdminStatus(email: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status }),
    })
    if (res.ok) return true
  } catch {}
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("zil_admin_invites")
      const invites: AdminUserRecord[] = raw ? JSON.parse(raw) : []
      const invite = invites.find((i) => i.email === email)
      if (invite) {
        invite.status = status
        localStorage.setItem("zil_admin_invites", JSON.stringify(invites))
        return true
      }
    }
  } catch {}
  return false
}
