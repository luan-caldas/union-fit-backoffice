"use server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { fetchAll } from "@/lib/supabase/fetch-all"
import { revalidatePath } from "next/cache"

export type PeriodizationDetail = {
  uuid: string
  periodization_uuid: string
  order: number
  min_repetitions: number
  max_repetitions: number
}

export type PeriodizationWithLevel = {
  uuid: string
  level_uuid: string
  level_title: string
  level_enum: string
  details: PeriodizationDetail[]
}

export async function getPeriodizations(): Promise<PeriodizationWithLevel[]> {
  const admin = await requireAdmin()

  const [periodsResult, detailsResult, levelsResult] = await Promise.all([
    fetchAll((from, to) =>
      admin
        .from("workout.periodization")
        .select("uuid, level_uuid")
        .order("uuid")
        .range(from, to)
    ),
    fetchAll((from, to) =>
      admin
        .from("workout.periodization.details")
        .select("*")
        .order("order")
        .order("uuid")
        .range(from, to)
    ),
    admin
      .from("info_workout.level")
      .select("uuid, title, level_enum")
      .order("order"),
  ])

  if (periodsResult.error) throw new Error("Erro ao carregar periodizações.")
  if (detailsResult.error) throw new Error("Erro ao carregar detalhes.")
  if (levelsResult.error) throw new Error("Erro ao carregar níveis.")

  const levels = levelsResult.data ?? []
  const details = detailsResult.data

  return periodsResult.data.map((p) => {
    const level = levels.find((l) => l.uuid === p.level_uuid)
    return {
      uuid: p.uuid,
      level_uuid: p.level_uuid,
      level_title: level?.title ?? "—",
      level_enum: level?.level_enum ?? "",
      details: details.filter((d) => d.periodization_uuid === p.uuid),
    }
  })
}

export async function upsertPeriodizationDetail(payload: {
  uuid?: string
  periodization_uuid: string
  order: number
  min_repetitions: number
  max_repetitions: number
}) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.periodization.details")
    .upsert(payload)

  if (error) throw new Error("Erro ao salvar detalhe.")
  revalidatePath("/periodization")
}

export async function deletePeriodizationDetail(uuid: string) {
  const admin = await requireAdmin()
  const { error } = await admin
    .from("workout.periodization.details")
    .delete()
    .eq("uuid", uuid)

  if (error) throw new Error("Erro ao excluir detalhe.")
  revalidatePath("/periodization")
}
