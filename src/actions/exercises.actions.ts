"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { Database } from "@/lib/supabase/database.types"

export type ExerciseRow = {
  uuid: string
  name: string
  description: string | null
  muscle: Database["public"]["Enums"]["Muscle"]
  repetition_type: Database["public"]["Enums"]["RepetitionType"]
  level_uuid: string[] | null
  methods_support_uuid: string[]
  image_url: string | null
  video_url: string | null
}

export async function getExercises(): Promise<ExerciseRow[]> {
  const admin = await createClient()
  const { data, error } = await admin
    .from("workout.exercise")
    .select("*")
    .order("name")

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertExercise(payload: {
  uuid?: string
  name: string
  description?: string | null
  muscle: Database["public"]["Enums"]["Muscle"]
  repetition_type: Database["public"]["Enums"]["RepetitionType"]
  level_uuid: string[]
  methods_support_uuid: string[]
  video_url?: string | null
}) {
  const admin = await createClient()
  const image_url = getYouTubeThumbnail(payload.video_url)

  const { error } = await admin.from("workout.exercise").upsert({
    ...payload,
    image_url,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/exercises")
}

export async function getLevels() {
  const admin = await createClient()
  const { data, error } = await admin
    .from("info_workout.level")
    .select("uuid, title, level_enum")
    .order("order")

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getObjectives() {
  const admin = await createClient()
  const { data, error } = await admin
    .from("info_workout.objective")
    .select("uuid, title")
    .order("order")

  if (error) throw new Error(error.message)
  return data ?? []
}
