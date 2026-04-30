"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
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
  const admin = await requireAdmin()
  const { data, error } = await admin
    .from("workout.exercise")
    .select("*")
    .order("name")

  if (error) throw new Error("Erro ao carregar exercícios.")
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
  const admin = await requireAdmin()
  const image_url = getYouTubeThumbnail(payload.video_url)

  const { error } = await admin.from("workout.exercise").upsert({
    ...payload,
    image_url,
  })

  if (error) throw new Error("Erro ao salvar exercício.")
  revalidatePath("/exercises")
}

export async function deleteExercise(uuid: string) {
  const admin = await requireAdmin()
  const { error } = await admin.from("workout.exercise").delete().eq("uuid", uuid)
  if (error) throw new Error("Erro ao excluir exercício.")
  revalidatePath("/exercises")
}

export async function getLevels() {
  const admin = await requireAdmin()
  const { data, error } = await admin
    .from("info_workout.level")
    .select("uuid, title, level_enum")
    .order("order")

  if (error) throw new Error("Erro ao carregar níveis.")
  return data ?? []
}

export async function getObjectives() {
  const admin = await requireAdmin()
  const { data, error } = await admin
    .from("info_workout.objective")
    .select("uuid, title")
    .order("order")

  if (error) throw new Error("Erro ao carregar objetivos.")
  return data ?? []
}
