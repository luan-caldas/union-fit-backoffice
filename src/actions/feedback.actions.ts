"use server"

import { requireAdmin } from "@/lib/auth/require-admin"

export type FeedbackPeriod = "7d" | "30d" | "past"

export type SessionFeedbackStats = {
  counts: Record<string, number>
  total: number
  unanswered: number
  method: "training" | "window" | null
  periodStart: string | null
  periodEnd: string | null
}

export type CycleFeedbackBlock = {
  training_uuid: string
  isCurrent: boolean
  periodStart: string | null
  periodEnd: string | null
  answers: { question: string; answer: string; answered_at: string }[]
}

const DAY_MS = 24 * 60 * 60 * 1000
const QUESTION = "difficulty"
const CYCLE_ORDER = ["satisfaction", "discomfort", "improvement"]

type SessionRow = { uuid: string; finished_at: string; training_uuid: string | null }

async function getCurrentTraining(
  admin: Awaited<ReturnType<typeof requireAdmin>>,
  userId: string
) {
  const { data, error } = await admin
    .from("workout.training")
    .select("uuid, date_start, date_end")
    .eq("user_uuid", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error("Erro ao carregar treino atual.")
  return data
}

export async function getSessionFeedbackStats(
  userId: string,
  period: FeedbackPeriod
): Promise<SessionFeedbackStats> {
  const admin = await requireAdmin()

  const base = () =>
    admin
      .from("workout.session")
      .select("uuid, finished_at, training_uuid")
      .eq("user_uuid", userId)
      .eq("is_deleted", false)
      .eq("workout_type", "training")

  let sessions: SessionRow[] = []
  let method: SessionFeedbackStats["method"] = null

  if (period === "7d" || period === "30d") {
    const since = new Date(Date.now() - (period === "7d" ? 7 : 30) * DAY_MS)
    const { data, error } = await base().gte("finished_at", since.toISOString())
    if (error) throw new Error("Erro ao carregar sessões.")
    sessions = data ?? []
  } else {
    const current = await getCurrentTraining(admin, userId)

    // Método B: treino passado = training_uuid mais recente nas sessões, diferente do atual.
    let pastQuery = base().not("training_uuid", "is", null)
    if (current) pastQuery = pastQuery.neq("training_uuid", current.uuid)
    const { data: latest, error: latestError } = await pastQuery
      .order("finished_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latestError) throw new Error("Erro ao carregar sessões.")

    if (latest?.training_uuid) {
      const { data, error } = await base().eq("training_uuid", latest.training_uuid)
      if (error) throw new Error("Erro ao carregar sessões.")
      sessions = data ?? []
      method = "training"
    } else if (current?.date_start) {
      // Método A: 28 dias antes do início do treino atual.
      const end = new Date(`${current.date_start}T00:00:00-03:00`)
      const start = new Date(end.getTime() - 28 * DAY_MS)
      const { data, error } = await base()
        .gte("finished_at", start.toISOString())
        .lt("finished_at", end.toISOString())
      if (error) throw new Error("Erro ao carregar sessões.")
      sessions = data ?? []
      method = "window"
    }
  }

  const counts: Record<string, number> = {}
  if (sessions.length) {
    const { data, error } = await admin
      .from("workout.session.feedback")
      .select("answer")
      .eq("question", QUESTION)
      .in(
        "session_uuid",
        sessions.map((s) => s.uuid)
      )
    if (error) throw new Error("Erro ao carregar respostas das sessões.")
    for (const f of data ?? []) counts[f.answer] = (counts[f.answer] ?? 0) + 1
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const times = sessions.map((s) => s.finished_at).sort()

  return {
    counts,
    total,
    unanswered: sessions.length - total,
    method,
    periodStart: times[0] ?? null,
    periodEnd: times[times.length - 1] ?? null,
  }
}

const latestAnswer = (b: CycleFeedbackBlock) =>
  Math.max(...b.answers.map((a) => Date.parse(a.answered_at)))

export async function getTrainingFeedbackHistory(
  userId: string
): Promise<CycleFeedbackBlock[]> {
  const admin = await requireAdmin()

  const { data, error } = await admin
    .from("workout.training.feedback")
    .select("training_uuid, question, answer, answered_at")
    .eq("user_uuid", userId)
    .order("answered_at", { ascending: false })
  if (error) throw new Error("Erro ao carregar respostas dos ciclos.")

  const rows = data ?? []
  if (!rows.length) return []

  const grouped = new Map<string, CycleFeedbackBlock["answers"]>()
  for (const r of rows) {
    const list = grouped.get(r.training_uuid) ?? []
    list.push({ question: r.question, answer: r.answer, answered_at: r.answered_at })
    grouped.set(r.training_uuid, list)
  }

  const [current, sessionsResult] = await Promise.all([
    getCurrentTraining(admin, userId),
    admin
      .from("workout.session")
      .select("training_uuid, finished_at")
      .eq("user_uuid", userId)
      .eq("is_deleted", false)
      .in("training_uuid", [...grouped.keys()]),
  ])
  if (sessionsResult.error) throw new Error("Erro ao carregar sessões dos ciclos.")

  const ranges = new Map<string, { min: string; max: string }>()
  for (const s of sessionsResult.data ?? []) {
    if (!s.training_uuid) continue
    const r = ranges.get(s.training_uuid)
    if (!r) ranges.set(s.training_uuid, { min: s.finished_at, max: s.finished_at })
    else {
      if (s.finished_at < r.min) r.min = s.finished_at
      if (s.finished_at > r.max) r.max = s.finished_at
    }
  }

  const rank = (q: string) => {
    const i = CYCLE_ORDER.indexOf(q)
    return i === -1 ? CYCLE_ORDER.length : i
  }

  return [...grouped.entries()]
    .map(([training_uuid, answers]) => {
      const isCurrent = current?.uuid === training_uuid
      const range = ranges.get(training_uuid)
      return {
        training_uuid,
        isCurrent,
        periodStart: isCurrent ? (current?.date_start ?? null) : (range?.min ?? null),
        periodEnd: isCurrent ? (current?.date_end ?? null) : (range?.max ?? null),
        answers: answers.sort((a, b) => rank(a.question) - rank(b.question)),
      }
    })
    .sort((a, b) => latestAnswer(b) - latestAnswer(a))
}
