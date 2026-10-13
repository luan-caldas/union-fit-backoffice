"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import type { Database } from "@/lib/supabase/database.types"

export type WorkoutSessionCursor = {
  finished_at: string
  uuid: string
}

export type WorkoutSession = {
  uuid: string
  workout_type: string
  division_name: string
  started_at: string
  finished_at: string
  completion_percentage: number
  auto_finished: boolean
}

export type WorkoutSessionsPage = {
  sessions: WorkoutSession[]
  nextCursor: WorkoutSessionCursor | null
}

export type WorkoutSessionExercise = {
  uuid: string
  exercise_order: number
  exercise_name: string
  method_name: string | null
  sets_planned: number | null
  sets_done: number | null
  completed_at: string
  weight_kilograms: number | null
  weight_pounds: number | null
  input_unit: Database["public"]["Enums"]["WeightType"] | null
}

const SESSIONS_PAGE_SIZE = 20

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Lê direto das tabelas base (não das views api.*, que filtram por auth.uid()).
// Paginação keyset sobre (finished_at DESC, uuid DESC), que usa o índice
// (user_uuid, finished_at DESC).
export async function getWorkoutSessions(
  userId: string,
  cursor?: WorkoutSessionCursor | null
): Promise<WorkoutSessionsPage> {
  const admin = await requireAdmin()

  let query = admin
    .from("workout.session")
    .select(
      "uuid, workout_type, division_name, started_at, finished_at, completion_percentage, auto_finished"
    )
    .eq("user_uuid", userId)
    .eq("is_deleted", false)

  if (cursor) {
    // Valida o cursor antes de interpolar no filtro `or(...)`.
    if (!UUID_RE.test(cursor.uuid) || Number.isNaN(Date.parse(cursor.finished_at))) {
      throw new Error("Cursor inválido.")
    }
    const ts = `"${new Date(cursor.finished_at).toISOString()}"`
    query = query.or(
      `finished_at.lt.${ts},and(finished_at.eq.${ts},uuid.lt.${cursor.uuid})`
    )
  }

  const { data, error } = await query
    .order("finished_at", { ascending: false })
    .order("uuid", { ascending: false })
    .limit(SESSIONS_PAGE_SIZE + 1)

  if (error) throw new Error("Erro ao carregar histórico de treinos.")

  const rows = data ?? []
  const hasMore = rows.length > SESSIONS_PAGE_SIZE
  const sessions = hasMore ? rows.slice(0, SESSIONS_PAGE_SIZE) : rows
  const last = sessions[sessions.length - 1]

  return {
    sessions,
    nextCursor:
      hasMore && last ? { finished_at: last.finished_at, uuid: last.uuid } : null,
  }
}

export async function getWorkoutSessionExercises(
  sessionUuid: string
): Promise<WorkoutSessionExercise[]> {
  const admin = await requireAdmin()

  const { data, error } = await admin
    .from("workout.session.exercise")
    .select(
      "uuid, exercise_uuid, method_uuid, exercise_order, sets_planned, sets_done, completed_at, weight_kilograms, weight_pounds, input_unit"
    )
    .eq("session_uuid", sessionUuid)
    .order("exercise_order")

  if (error) throw new Error("Erro ao carregar exercícios da sessão.")

  const rows = data ?? []
  const exerciseUuids = [...new Set(rows.map((r) => r.exercise_uuid))]
  const methodUuids = [
    ...new Set(rows.map((r) => r.method_uuid).filter((m): m is string => !!m)),
  ]

  const [exercisesResult, methodsResult] = await Promise.all([
    exerciseUuids.length
      ? admin.from("workout.exercise").select("uuid, name").in("uuid", exerciseUuids)
      : { data: [], error: null },
    methodUuids.length
      ? admin.from("workout.method").select("uuid, name").in("uuid", methodUuids)
      : { data: [], error: null },
  ])

  if (exercisesResult.error) throw new Error("Erro ao carregar nomes dos exercícios.")
  if (methodsResult.error) throw new Error("Erro ao carregar nomes dos métodos.")

  const exerciseNames = new Map((exercisesResult.data ?? []).map((e) => [e.uuid, e.name]))
  const methodNames = new Map((methodsResult.data ?? []).map((m) => [m.uuid, m.name]))

  return rows.map((r) => ({
    uuid: r.uuid,
    exercise_order: r.exercise_order,
    exercise_name: exerciseNames.get(r.exercise_uuid) ?? "Exercício removido",
    method_name: r.method_uuid ? (methodNames.get(r.method_uuid) ?? null) : null,
    sets_planned: r.sets_planned,
    sets_done: r.sets_done,
    completed_at: r.completed_at,
    weight_kilograms: r.weight_kilograms,
    weight_pounds: r.weight_pounds,
    input_unit: r.input_unit,
  }))
}
