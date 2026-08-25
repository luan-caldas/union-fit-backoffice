"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/database.types"

export type CardioExerciseMetrics = {
  pace_min_seconds: number | null
  pace_max_seconds: number | null
  speed_min: number | null
  speed_max: number | null
  rpm_min: number | null
  rpm_max: number | null
  duration_seconds: number | null
  distance_meters: number | null
  incline_degrees: number | null
}

export type CardioExerciseDetails = {
  uuid: string
  name: string
  muscle: Database["public"]["Enums"]["Muscle"]
  image_url: string | null
  video_url: string | null
}

export type CardioExercise = CardioExerciseMetrics & {
  uuid: string
  exercise_uuid: string
  order: number
  exercise_details: CardioExerciseDetails | null
}

export type Cardio = {
  uuid: string
  user_uuid: string
  name: string
  description: string | null
  duration: number | null
  order: number
  created_at: string
  exercises: CardioExercise[]
}

export async function getCardiosByUserId(userId: string): Promise<Cardio[]> {
  const admin = await requireAdmin()

  const [cardiosResult, exercisesResult] = await Promise.all([
    admin
      .from("workout.cardio")
      .select("*")
      .eq("user_uuid", userId)
      .order("order"),
    admin
      .from("workout.cardio.exercise")
      .select("*")
      .eq("user_uuid", userId)
      .order("order"),
  ])

  if (cardiosResult.error) throw new Error("Erro ao carregar treinos de cardio.")
  if (exercisesResult.error) throw new Error("Erro ao carregar exercícios de cardio.")

  const cardios = cardiosResult.data ?? []
  const cardioExercises = exercisesResult.data ?? []

  const exerciseUuids = [...new Set(cardioExercises.map((e) => e.exercise_uuid))]
  const detailsByUuid = new Map<string, CardioExerciseDetails>()

  if (exerciseUuids.length > 0) {
    const { data, error } = await admin
      .from("workout.exercise")
      .select("uuid, name, muscle, image_url, video_url")
      .in("uuid", exerciseUuids)

    if (error) throw new Error("Erro ao carregar detalhes dos exercícios.")
    for (const detail of data ?? []) detailsByUuid.set(detail.uuid, detail)
  }

  return cardios.map((cardio) => ({
    uuid: cardio.uuid,
    user_uuid: cardio.user_uuid,
    name: cardio.name,
    description: cardio.description,
    duration: cardio.duration,
    order: cardio.order,
    created_at: cardio.created_at,
    exercises: cardioExercises
      .filter((e) => e.cardio_uuid === cardio.uuid)
      .map((e) => ({
        uuid: e.uuid,
        exercise_uuid: e.exercise_uuid,
        order: e.order,
        pace_min_seconds: e.pace_min_seconds,
        pace_max_seconds: e.pace_max_seconds,
        speed_min: e.speed_min,
        speed_max: e.speed_max,
        rpm_min: e.rpm_min,
        rpm_max: e.rpm_max,
        duration_seconds: e.duration_seconds,
        distance_meters: e.distance_meters,
        incline_degrees: e.incline_degrees,
        exercise_details: detailsByUuid.get(e.exercise_uuid) ?? null,
      })),
  }))
}

export async function addCardio(userUuid: string, order: number) {
  const admin = await requireAdmin()
  const { error } = await admin.from("workout.cardio").insert({
    user_uuid: userUuid,
    name: `Cardio ${order + 1}`,
    order,
  })

  if (error) throw new Error("Erro ao adicionar treino de cardio.")
  revalidatePath(`/users/${userUuid}`)
}

export async function updateCardio(
  cardioUuid: string,
  payload: {
    name?: string
    description?: string | null
    duration?: number | null
  },
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio")
    .update(payload)
    .eq("uuid", cardioUuid)

  if (error) throw new Error("Erro ao atualizar treino de cardio.")
  revalidatePath(`/users/${userId}`)
}

export async function deleteCardio(cardioUuid: string, userId: string) {
  const admin = await requireAdmin()

  await admin
    .from("workout.cardio.exercise")
    .delete()
    .eq("cardio_uuid", cardioUuid)

  const { error } = await admin
    .from("workout.cardio")
    .delete()
    .eq("uuid", cardioUuid)

  if (error) throw new Error("Erro ao excluir treino de cardio.")
  revalidatePath(`/users/${userId}`)
}

export async function reorderCardios(
  cardios: { uuid: string; order: number }[],
  userId: string
) {
  const admin = await requireAdmin()
  await Promise.all(
    cardios.map(({ uuid, order }) =>
      admin.from("workout.cardio").update({ order }).eq("uuid", uuid)
    )
  )
  revalidatePath(`/users/${userId}`)
}

export async function addExerciseToCardio(
  cardioUuid: string,
  exerciseUuid: string,
  userUuid: string,
  order: number
) {
  const admin = await requireAdmin()
  const { error } = await admin.from("workout.cardio.exercise").insert({
    cardio_uuid: cardioUuid,
    exercise_uuid: exerciseUuid,
    user_uuid: userUuid,
    order,
  })

  if (error) throw new Error("Erro ao adicionar exercício.")
  revalidatePath(`/users/${userUuid}`)
}

export async function removeExerciseFromCardio(
  cardioExerciseUuid: string,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio.exercise")
    .delete()
    .eq("uuid", cardioExerciseUuid)

  if (error) throw new Error("Erro ao remover exercício.")
  revalidatePath(`/users/${userId}`)
}

export async function swapExerciseInCardio(
  cardioExerciseUuid: string,
  newExerciseUuid: string,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio.exercise")
    .update({ exercise_uuid: newExerciseUuid })
    .eq("uuid", cardioExerciseUuid)

  if (error) throw new Error("Erro ao trocar exercício.")
  revalidatePath(`/users/${userId}`)
}

export async function updateCardioExerciseMetrics(
  cardioExerciseUuid: string,
  metrics: CardioExerciseMetrics,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.cardio.exercise")
    .update(metrics)
    .eq("uuid", cardioExerciseUuid)

  if (error) throw new Error("Erro ao salvar métricas.")
  revalidatePath(`/users/${userId}`)
}

export async function reorderCardioExercises(
  exercises: { uuid: string; order: number }[],
  userId: string
) {
  const admin = await requireAdmin()
  await Promise.all(
    exercises.map(({ uuid, order }) =>
      admin.from("workout.cardio.exercise").update({ order }).eq("uuid", uuid)
    )
  )
  revalidatePath(`/users/${userId}`)
}
