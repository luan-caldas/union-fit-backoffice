"use server"

import { requireAdmin } from "@/lib/auth/require-admin"

export type ChartPeriod = "4w" | "12w" | "6m"

export type TimeSeriesPoint = {
  date: string
  label: string
  value: number
}

export type LevelPoint = {
  level: string
  label: string
  count: number
}

// ─── Grouping helpers ────────────────────────────────────────────────────────

function weekKey(d: Date): string {
  const c = new Date(d)
  const day = c.getUTCDay()
  c.setUTCDate(c.getUTCDate() - (day === 0 ? 6 : day - 1))
  c.setUTCHours(0, 0, 0, 0)
  return c.toISOString().slice(0, 10)
}

function monthKey(d: Date): string {
  return d.toISOString().slice(0, 7)
}

function startOfPeriod(period: ChartPeriod): Date {
  const now = new Date()
  if (period === "4w")  { now.setUTCDate(now.getUTCDate() - 28); return now }
  if (period === "12w") { now.setUTCDate(now.getUTCDate() - 84); return now }
  now.setUTCMonth(now.getUTCMonth() - 6)
  return now
}

function buildBuckets(period: ChartPeriod, start: Date): string[] {
  const keys: string[] = []
  const isMonthly = period === "6m"
  const end = new Date()

  if (isMonthly) {
    const cursor = new Date(start)
    cursor.setUTCDate(1)
    cursor.setUTCHours(0, 0, 0, 0)
    while (cursor <= end) {
      keys.push(monthKey(cursor))
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    }
  } else {
    const cursor = new Date(start)
    const day = cursor.getUTCDay()
    cursor.setUTCDate(cursor.getUTCDate() - (day === 0 ? 6 : day - 1))
    cursor.setUTCHours(0, 0, 0, 0)
    while (cursor <= end) {
      keys.push(cursor.toISOString().slice(0, 10))
      cursor.setUTCDate(cursor.getUTCDate() + 7)
    }
  }

  return keys
}

function bucketLabel(key: string, period: ChartPeriod): string {
  if (period === "6m") {
    const [y, m] = key.split("-")
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
    return `${months[parseInt(m) - 1]}/${y.slice(2)}`
  }
  const [, m, d] = key.split("-")
  return `${d}/${m}`
}

function keyForDate(d: Date, period: ChartPeriod): string {
  return period === "6m" ? monthKey(d) : weekKey(d)
}

function groupByPeriod(dates: string[], period: ChartPeriod): TimeSeriesPoint[] {
  const start = startOfPeriod(period)
  const buckets = buildBuckets(period, start)
  const counts = new Map<string, number>(buckets.map((k) => [k, 0]))

  for (const raw of dates) {
    if (!raw) continue
    const d = new Date(raw)
    const key = keyForDate(d, period)
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return buckets.map((key) => ({
    date: key,
    label: bucketLabel(key, period),
    value: counts.get(key) ?? 0,
  }))
}

// ─── Server actions ──────────────────────────────────────────────────────────

// api.training.level stores the display label directly (not the Level enum)
const LEVEL_ORDER = ["Iniciante", "Intermediário", "Avançado"]

export async function getNewTrainingsChart(period: ChartPeriod): Promise<TimeSeriesPoint[]> {
  const admin = await requireAdmin()
  const start = startOfPeriod(period)

  const { data, error } = await admin
    .from("api.training")
    .select("created_at")
    .gte("created_at", start.toISOString())

  if (error) throw new Error("Erro ao carregar dados de treinos.")

  return groupByPeriod((data ?? []).map((r) => r.created_at ?? ""), period)
}

export async function getNewSubscriptionsChart(period: ChartPeriod): Promise<TimeSeriesPoint[]> {
  const admin = await requireAdmin()
  const start = startOfPeriod(period)

  const { data, error } = await admin
    .from("user_subscriptions")
    .select("last_event_at")
    .eq("is_active", true)
    .gte("last_event_at", start.toISOString())

  if (error) throw new Error("Erro ao carregar dados de assinaturas.")

  return groupByPeriod((data ?? []).map((r) => r.last_event_at ?? ""), period)
}

export async function getTrainingLevelDistribution(): Promise<LevelPoint[]> {
  const admin = await requireAdmin()

  const { data, error } = await admin
    .from("api.training")
    .select("level")

  if (error) throw new Error("Erro ao carregar distribuição de níveis.")

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    if (!row.level) continue
    counts.set(row.level, (counts.get(row.level) ?? 0) + 1)
  }

  const result: LevelPoint[] = []

  for (const level of LEVEL_ORDER) {
    if (counts.has(level)) {
      result.push({ level, label: level, count: counts.get(level)! })
    }
  }

  for (const [level, count] of counts) {
    if (!LEVEL_ORDER.includes(level)) {
      result.push({ level, label: level, count })
    }
  }

  return result
}
