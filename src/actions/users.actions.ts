"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import type { Json } from "@/lib/supabase/database.types"

export type UserWithSubscription = {
  id: string
  name: string | null
  email: string | null
  image_profile: string | null
  deleted_at: string | null
  user_subscriptions: {
    is_active: boolean
    expiration_at: string | null
    entitlement_id: string | null
    last_event_type: string | null
    last_event_at: string | null
  } | null
}

export type UserInfoWorkout = {
  user_id: string | null
  info_workout_data: Json | null
  level_data: Json | null
  gender_data: Json | null
  objectives: Json | null
  equipments_liked: Json | null
  equipments_unliked: Json | null
  exercises_liked: Json | null
  exercises_unliked: Json | null
}

export type ApiTraining = {
  uuid: string | null
  user_uuid: string | null
  date_start: string | null
  date_end: string | null
  created_at: string | null
  sessions_per_week: number | null
  level: string | null
  periodization: Json | null
  divisions: Json | null
}

export type UsersPage = {
  users: UserWithSubscription[]
  total: number
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Valor seguro para dentro de `or(...)` do PostgREST: escapa curingas do LIKE
// e depois aspas/barras da sintaxe de string entre aspas duplas.
function toIlikePattern(term: string) {
  const likeEscaped = term.replace(/[\\%_]/g, "\\$&")
  const quoted = likeEscaped.replace(/[\\"]/g, "\\$&")
  return `"%${quoted}%"`
}

export async function getUsers(params: {
  page: number
  pageSize: number
  search?: string
}): Promise<UsersPage> {
  const admin = await requireAdmin()

  const pageSize = Math.min(Math.max(Math.floor(params.pageSize), 1), 100)
  const page = Math.max(Math.floor(params.page), 1)
  const from = (page - 1) * pageSize
  const search = params.search?.trim()

  let query = admin
    .from("user")
    .select("id, name, email, image_profile, deleted_at", { count: "exact" })
    .is("deleted_at", null)

  if (search) {
    const pattern = toIlikePattern(search)
    const filters = [`name.ilike.${pattern}`, `email.ilike.${pattern}`]
    if (UUID_RE.test(search)) filters.push(`id.eq.${search}`)
    query = query.or(filters.join(","))
  }

  const usersResult = await query
    .order("name")
    .order("id")
    .range(from, from + pageSize - 1)

  if (usersResult.error) throw new Error("Erro ao carregar usuários.")

  const users = usersResult.data ?? []
  const ids = users.map((u) => u.id)

  const subsResult = ids.length
    ? await admin
        .from("user_subscriptions")
        .select(
          "user_id, is_active, expiration_at, entitlement_id, last_event_type, last_event_at"
        )
        .in("user_id", ids)
    : { data: [], error: null }

  if (subsResult.error) throw new Error("Erro ao carregar assinaturas.")

  const subsMap = new Map((subsResult.data ?? []).map((s) => [s.user_id, s]))

  return {
    total: usersResult.count ?? 0,
    users: users.map((u) => ({
      ...u,
      user_subscriptions: subsMap.get(u.id) ?? null,
    })),
  }
}

export async function getUserById(id: string) {
  const admin = await requireAdmin()

  const [userResult, infoResult, subResult, trainingResult] = await Promise.all(
    [
      admin.from("user").select("*").eq("id", id).single(),
      admin
        .from("backend.user_info_workout")
        .select("*")
        .eq("user_id", id)
        .maybeSingle(),
      admin
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", id)
        .maybeSingle(),
      admin
        .from("api.training")
        .select("*")
        .eq("user_uuid", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]
  )

  if (userResult.error) throw new Error("Erro ao carregar usuário.")

  return {
    user: userResult.data,
    infoWorkout: infoResult.data as UserInfoWorkout | null,
    subscription: subResult.data,
    training: trainingResult.data as ApiTraining | null,
  }
}
