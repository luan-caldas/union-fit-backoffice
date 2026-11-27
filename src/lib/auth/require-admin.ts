import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

// cache() deduplicates calls within the same server render cycle —
// avoids redundant auth.getUser + user_role queries when multiple
// server functions call requireAdmin() on the same request.
export const requireAdmin = cache(async () => {
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
})
