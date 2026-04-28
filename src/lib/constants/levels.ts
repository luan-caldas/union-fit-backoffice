import type { Database } from "@/lib/supabase/database.types"

type Level = Database["public"]["Enums"]["Level"]

export const LEVEL_LABELS: Record<Level, string> = {
  BEGINNER: "Iniciante",
  INTERMEDIARY: "Intermediário",
  ADVANCED: "Avançado",
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(
  ([value, label]) => ({ value: value as Level, label })
)
