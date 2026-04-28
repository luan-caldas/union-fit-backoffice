"use server"

import { createClient } from "@/lib/supabase/server"
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

export async function getUsers(): Promise<UserWithSubscription[]> {
  const admin = await createClient()
  const { data, error } = await admin
    .from("user")
    .select(
      "id, name, email, image_profile, deleted_at, user_subscriptions(is_active, expiration_at, entitlement_id, last_event_type, last_event_at)"
    )
    .is("deleted_at", null)
    .order("name")

  if (error) throw new Error(error.message)

  return (data ?? []).map((u) => ({
    ...u,
    user_subscriptions: Array.isArray(u.user_subscriptions)
      ? (u.user_subscriptions[0] ?? null)
      : (u.user_subscriptions ?? null),
  }))
}

export async function getUserById(id: string) {
  const admin = await createClient()

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

  if (userResult.error) throw new Error(userResult.error.message)

  return {
    user: userResult.data,
    infoWorkout: infoResult.data as UserInfoWorkout | null,
    subscription: subResult.data,
    training: trainingResult.data as ApiTraining | null,
  }
}
