"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type SignInError = {
  error: string
  type: "network" | "auth" | "forbidden"
}

export async function signIn(
  email: string,
  password: string
): Promise<SignInError | never> {
  const supabase = await createClient()

  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"]
  let authError: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"]

  try {
    const result = await supabase.auth.signInWithPassword({ email, password })
    data = result.data
    authError = result.error
  } catch (e) {
    return {
      error: "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
      type: "network",
    }
  }

  if (authError || !data.user) {
    return { error: "E-mail ou senha incorretos.", type: "auth" }
  }

  const { data: roleRow } = await supabase
    .from("user_role")
    .select("role")
    .eq("user_uuid", data.user.id)
    .single()

  if (roleRow?.role !== "ADMIN") {
    await supabase.auth.signOut()
    return {
      error: "Acesso negado. Apenas administradores podem entrar.",
      type: "forbidden",
    }
  }

  redirect("/users")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
