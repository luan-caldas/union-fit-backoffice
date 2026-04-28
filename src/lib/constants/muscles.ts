import type { Database } from "@/lib/supabase/database.types"

type Muscle = Database["public"]["Enums"]["Muscle"]

export const MUSCLE_LABELS: Record<Muscle, string> = {
  ABDOMEN: "Abdômen",
  BACK: "Costas",
  BICEPS: "Bíceps",
  CALF: "Panturrilha",
  CHEST: "Peito",
  FOREARM: "Antebraço",
  GLUTES: "Glúteos",
  LOWER_BACK: "Lombar",
  OTHER: "Outro",
  POSTERIOR_THIGH: "Posterior da coxa",
  QUADRICEPS: "Quadríceps",
  SHOULDER: "Ombro",
  TRAPEZIUS: "Trapézio",
  TRICEPS: "Tríceps",
}

export const MUSCLE_OPTIONS = Object.entries(MUSCLE_LABELS).map(
  ([value, label]) => ({ value: value as Muscle, label })
)
