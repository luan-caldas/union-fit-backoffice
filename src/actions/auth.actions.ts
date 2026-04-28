"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: "Credenciais inválidas. Verifique seu e-mail e senha." }
  }

  console.log(data);

  const admin = createAdminClient()
  const { data: roleRow } = await admin
    .from("user_role")
    .select("role")
    .eq("user_uuid", data.user.id)
    .single()

    console.log(roleRow);

  if (roleRow?.role !== "ADMIN") {
    await supabase.auth.signOut()
    return {
      error: "Acesso negado. Apenas administradores podem acessar este painel.",
    }
  }

  redirect("/users")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
