import { requireAuth } from "@/lib/auth-guard"
import { auth } from "@/auth"
import AdminHeader from "@/components/admin/AdminHeader"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  const session = await auth()

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={session?.user ?? null} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
