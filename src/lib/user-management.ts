import { ADMIN_USERS, type Role } from "./roles"

const INVITES_KEY = "tf_admin_invites"

export interface AdminUserRecord {
  email: string
  role: Role
  status: "active" | "invited" | "disabled"
  lastLogin?: string
  invitedAt: number
}

export { ADMIN_USERS, type Role }

function loadInvites(): AdminUserRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(INVITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveInvites(invites: AdminUserRecord[]) {
  localStorage.setItem(INVITES_KEY, JSON.stringify(invites))
}

export function getAllAdminUsers(): AdminUserRecord[] {
  const builtIn = ADMIN_USERS.map((u) => ({
    email: u.email,
    role: u.role,
    status: "active" as const,
    invitedAt: 0,
  }))

  const invites = loadInvites()
  return [...builtIn, ...invites].sort((a, b) => a.email.localeCompare(b.email))
}

export function inviteAdmin(email: string, role: Role): AdminUserRecord {
  const invites = loadInvites()
  const existing = invites.find((i) => i.email === email)
  if (existing) {
    existing.role = role
    existing.status = "invited"
    saveInvites(invites)
    return existing
  }

  const record: AdminUserRecord = {
    email,
    role,
    status: "invited",
    invitedAt: Date.now(),
  }
  invites.push(record)
  saveInvites(invites)
  return record
}

export function removeAdmin(email: string): boolean {
  const builtInEmails = ADMIN_USERS.map((u) => u.email)
  if (builtInEmails.includes(email)) return false

  const invites = loadInvites()
  const filtered = invites.filter((i) => i.email !== email)
  if (filtered.length === invites.length) return false
  saveInvites(filtered)
  return true
}

export function updateAdminRole(email: string, role: Role): boolean {
  const invites = loadInvites()
  const invite = invites.find((i) => i.email === email)
  if (invite) {
    invite.role = role
    saveInvites(invites)
    return true
  }

  const builtIn = ADMIN_USERS.find((u) => u.email === email)
  if (builtIn) {
    const existing = invites.find((i) => i.email === email)
    if (existing) {
      existing.role = role
    } else {
      invites.push({ email, role, status: "active", invitedAt: 0 })
    }
    saveInvites(invites)
    return true
  }

  return false
}

export function setAdminStatus(email: string, status: "active" | "disabled"): boolean {
  const invites = loadInvites()
  const invite = invites.find((i) => i.email === email)
  if (invite) {
    invite.status = status
    saveInvites(invites)
    return true
  }
  return false
}
