"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/database.types"

export type MethodRow = {
  uuid: string
  name: string
  description: string | null
  video_url: string | null
  level_uuid: string[] | null
  objective_uuid: string[] | null
}

export async function getMethods(): Promise<MethodRow[]> {
  const admin = await createClient()
  const { data, error } = await admin
    .from("workout.method")
    .select("*")
    .order("name")

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function deleteMethod(uuid: string) {
  const admin = await createClient()
  const { error } = await admin.from("workout.method").delete().eq("uuid", uuid)
  if (error) throw new Error(error.message)
  revalidatePath("/methods")
}

export async function upsertMethod(payload: {
  uuid?: string
  name: string
  description?: string | null
  video_url?: string | null
  level_uuid?: string[]
  objective_uuid?: string[]
}) {
  const admin = await createClient()
  const { error } = await admin.from("workout.method").upsert(payload)
  if (error) throw new Error(error.message)
  revalidatePath("/methods")
}
