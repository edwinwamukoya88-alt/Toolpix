"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Trash2, Shield, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import {
  getAllAdminUsers, inviteAdmin, removeAdmin, updateAdminRole, setAdminStatus,
  type AdminUserRecord, type Role,
} from "@/lib/user-management"

const roleIcons: Record<Role, typeof Shield> = {
  admin: ShieldCheck,
  editor: Shield,
  viewer: ShieldAlert,
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("viewer")
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRecord | null>(null)

  useEffect(() => {
    setUsers(getAllAdminUsers())
    setLoading(false)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return users
    return users.filter(
      (u) => u.email.toLowerCase().includes(search.toLowerCase()),
    )
  }, [users, search])

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    inviteAdmin(inviteEmail.trim(), inviteRole)
    setUsers(getAllAdminUsers())
    setInviteEmail("")
    setShowInvite(false)
  }

  function handleRemove() {
    if (!deleteTarget) return
    removeAdmin(deleteTarget.email)
    setUsers(getAllAdminUsers())
    setDeleteTarget(null)
  }

  function handleRoleChange(email: string, role: Role) {
    updateAdminRole(email, role)
    setUsers(getAllAdminUsers())
  }

  function handleStatusToggle(email: string, current: string) {
    const newStatus = current === "active" ? "disabled" : "active"
    setAdminStatus(email, newStatus)
    setUsers(getAllAdminUsers())
  }

  const columns: Column<AdminUserRecord>[] = [
    {
      key: "email",
      label: "User",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {item.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm">{item.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (item) => {
        const Icon = roleIcons[item.role]
        return (
          <select
            value={item.role}
            onChange={(e) => handleRoleChange(item.email, e.target.value as Role)}
            className="rounded-lg border border-border/50 bg-background px-2 py-1 text-xs outline-none focus:border-primary/50"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => (
        <button onClick={() => handleStatusToggle(item.email, item.status)}>
          <StatusBadge
            status={item.status}
            variant={item.status === "active" ? "success" : item.status === "invited" ? "warning" : "danger"}
          />
        </button>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setDeleteTarget(item)}
            className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ]

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="User Management"
        description="Manage admin users, roles, and permissions"
        actions={
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invite Admin
          </button>
        }
      />

      <div className="space-y-6">
        {showInvite && (
          <form onSubmit={handleInvite} className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Invite New Admin</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                Send Invite
              </button>
            </div>
          </form>
        )}

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full rounded-lg border border-border/50 bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No admin users found."
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Admin"
        message={`Are you sure you want to remove "${deleteTarget?.email}"? They will lose access to the admin panel.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemove}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
