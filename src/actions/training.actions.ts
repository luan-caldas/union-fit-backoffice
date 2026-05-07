"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { revalidatePath } from "next/cache"

export type TrainingDivisionExercise = {
  uuid: string
  order: number
  sets: number
  method_uuid: string | null
  method_details: { uuid: string; name: string } | null
  exercise_details: {
    uuid: string
    name: string
    muscle: string
    image_url: string | null
    video_url: string | null
    description: string | null
    levels: string[]
    repetition_type: string
  }
}

export type TrainingDivision = {
  uuid: string
  name: string | null
  description: string | null
  duration: number | null
  order: number
  exercises: TrainingDivisionExercise[]
}

export type TrainingData = {
  uuid: string
  user_uuid: string
  date_start: string | null
  date_end: string | null
  created_at: string | null
  sessions_per_week: number | null
  level: string | null
  periodization: { order: number; min_repetitions: number; max_repetitions: number }[] | null
  divisions: TrainingDivision[]
}

export async function getTrainingByUserId(userId: string): Promise<TrainingData | null> {
  const admin = await requireAdmin()
  const { data, error } = await admin
    .from("api.training")
    .select("*")
    .eq("user_uuid", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error("Erro ao carregar treino.")
  if (!data) return null

  return {
    uuid: data.uuid ?? "",
    user_uuid: data.user_uuid ?? "",
    date_start: data.date_start,
    date_end: data.date_end,
    created_at: data.created_at,
    sessions_per_week: data.sessions_per_week,
    level: data.level,
    periodization: data.periodization as TrainingData["periodization"],
    divisions: ((data.divisions as TrainingDivision[]) ?? []).map((d) => ({
      ...d,
      exercises: d.exercises ?? [],
    })),
  }
}

export async function updateDivision(
  divisionUuid: string,
  payload: { name?: string; description?: string; duration?: number | null },
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.training.division")
    .update(payload)
    .eq("uuid", divisionUuid)

  if (error) throw new Error("Erro ao atualizar divisão.")
  revalidatePath(`/users/${userId}`)
}

export async function deleteDivision(divisionUuid: string, userId: string) {
  const admin = await requireAdmin()

  await admin
    .from("workout.training.division.exercise")
    .delete()
    .eq("division_uuid", divisionUuid)

  const { error } = await admin
    .from("workout.training.division")
    .delete()
    .eq("uuid", divisionUuid)

  if (error) throw new Error("Erro ao excluir divisão.")
  revalidatePath(`/users/${userId}`)
}

export async function addDivision(
  workoutUuid: string,
  userUuid: string,
  order: number
) {
  const admin = await requireAdmin()
  const { error } = await admin.from("workout.training.division").insert({
    workout_uuid: workoutUuid,
    user_uuid: userUuid,
    name: `Treino ${String.fromCharCode(65 + order)}`,
    order,
  })
  if (error) throw new Error("Erro ao adicionar divisão.")
  revalidatePath(`/users/${userUuid}`)
}

export async function updateExerciseSets(
  exerciseUuid: string,
  sets: number,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.training.division.exercise")
    .update({ sets })
    .eq("uuid", exerciseUuid)

  if (error) throw new Error("Erro ao atualizar séries.")
  revalidatePath(`/users/${userId}`)
}

export async function updateExerciseMethod(
  exerciseUuid: string,
  methodUuid: string | null,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.training.division.exercise")
    .update({ method_uuid: methodUuid })
    .eq("uuid", exerciseUuid)

  if (error) throw new Error("Erro ao atualizar método.")
  revalidatePath(`/users/${userId}`)
}

export async function addExerciseToDivision(
  divisionUuid: string,
  exerciseUuid: string,
  userUuid: string,
  order: number
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.training.division.exercise")
    .insert({
      division_uuid: divisionUuid,
      exercise_uuid: exerciseUuid,
      user_uuid: userUuid,
      sets: 3,
      order,
    })

  if (error) throw new Error("Erro ao adicionar exercício.")
  revalidatePath(`/users/${userUuid}`)
}

export async function removeExerciseFromDivision(
  divisionExerciseUuid: string,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.training.division.exercise")
    .delete()
    .eq("uuid", divisionExerciseUuid)

  if (error) throw new Error("Erro ao remover exercício.")
  revalidatePath(`/users/${userId}`)
}

export async function swapExerciseInDivision(
  divisionExerciseUuid: string,
  newExerciseUuid: string,
  userId: string
) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.training.division.exercise")
    .update({ exercise_uuid: newExerciseUuid, method_uuid: null })
    .eq("uuid", divisionExerciseUuid)

  if (error) throw new Error("Erro ao trocar exercício.")
  revalidatePath(`/users/${userId}`)
}

export async function reorderExercises(
  exercises: { uuid: string; order: number }[],
  userId: string
) {
  const admin = await requireAdmin()
  await Promise.all(
    exercises.map(({ uuid, order }) =>
      admin
        .from("workout.training.division.exercise")
        .update({ order })
        .eq("uuid", uuid)
    )
  )
  revalidatePath(`/users/${userId}`)
}
