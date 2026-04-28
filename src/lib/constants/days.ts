import type { Database } from "@/lib/supabase/database.types"

type DaysInWeek = Database["public"]["Enums"]["DaysInWeek"]

export const DAY_LABELS: Record<DaysInWeek, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
}
