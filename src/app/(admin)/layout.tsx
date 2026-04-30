import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Shell } from "@/components/layout/shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: roleRow } = await supabase
    .from("user_role")
    .select("role")
    .eq("user_uuid", user.id)
    .single()

  if (roleRow?.role !== "ADMIN") {
    await supabase.auth.signOut()
    redirect("/login")
  }

  return <Shell>{children}</Shell>
}
