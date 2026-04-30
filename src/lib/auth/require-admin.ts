import { createClient } from "@/lib/supabase/server"

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: roleRow } = await supabase
    .from("user_role")
    .select("role")
    .eq("user_uuid", user.id)
    .single()

  if (roleRow?.role !== "ADMIN") throw new Error("Forbidden")

  return supabase
}
