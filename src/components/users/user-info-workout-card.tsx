import type { UserInfoWorkout } from "@/actions/users.actions"
import { MUSCLE_LABELS } from "@/lib/constants/muscles"
import { DAY_LABELS } from "@/lib/constants/days"
import type { Database } from "@/lib/supabase/database.types"

type Muscle = Database["public"]["Enums"]["Muscle"]
type DaysInWeek = Database["public"]["Enums"]["DaysInWeek"]

interface UserInfoWorkoutCardProps {
  infoWorkout: UserInfoWorkout | null
}

export function UserInfoWorkoutCard({ infoWorkout }: UserInfoWorkoutCardProps) {
  if (!infoWorkout || !infoWorkout.info_workout_data) {
    return (
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="font-semibold text-foreground mb-3">Perfil de Treino</h3>
        <p className="text-sm text-muted-foreground">Informações de treino não preenchidas</p>
      </div>
    )
  }

  const iwd = infoWorkout.info_workout_data as Record<string, unknown>
  const levelData = infoWorkout.level_data as Record<string, unknown> | null
  const genderData = infoWorkout.gender_data as Record<string, unknown> | null
  const objectives = infoWorkout.objectives as { title: string }[] | null

  const muscles: Muscle[] = Array.isArray(iwd.muscle_focused)
    ? (iwd.muscle_focused as Muscle[])
    : []
  const days: DaysInWeek[] = Array.isArray(iwd.days_in_week)
    ? (iwd.days_in_week as DaysInWeek[])
    : []

  const age = iwd.year_birth
    ? String(new Date().getFullYear() - Number(iwd.year_birth))
    : "—"

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="font-semibold text-foreground mb-4">Perfil de Treino</h3>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <dt className="text-muted-foreground">Gênero</dt>
        <dd className="font-medium">
          {genderData ? String(genderData.title ?? "—") : "—"}
        </dd>

        <dt className="text-muted-foreground">Idade</dt>
        <dd className="font-medium">{age} anos</dd>

        <dt className="text-muted-foreground">Altura</dt>
        <dd className="font-medium">
          {iwd.height ? `${iwd.height} cm` : "—"}
        </dd>

        <dt className="text-muted-foreground">Peso</dt>
        <dd className="font-medium">
          {iwd.weight ? `${iwd.weight} kg` : "—"}
        </dd>

        <dt className="text-muted-foreground">Nível</dt>
        <dd className="font-medium">
          {levelData ? String(levelData.title ?? "—") : "—"}
        </dd>

        <dt className="text-muted-foreground">Duração da sessão</dt>
        <dd className="font-medium">
          {iwd.session_duration ? `${iwd.session_duration} min` : "—"}
        </dd>

        <dt className="text-muted-foreground">Objetivos</dt>
        <dd className="font-medium">
          {objectives?.length
            ? objectives.map((o) => o.title).join(", ")
            : "—"}
        </dd>

        <dt className="text-muted-foreground">Dias na semana</dt>
        <dd className="font-medium">
          {days.length
            ? days.map((d) => DAY_LABELS[d] ?? d).join(", ")
            : "—"}
        </dd>

        <dt className="text-muted-foreground">Músculos foco</dt>
        <dd className="font-medium col-span-1">
          {muscles.length
            ? muscles.map((m) => MUSCLE_LABELS[m] ?? m).join(", ")
            : "—"}
        </dd>

        {iwd.limitation && (
          <>
            <dt className="text-muted-foreground">Limitações</dt>
            <dd className="font-medium">{String(iwd.limitation)}</dd>
          </>
        )}
      </dl>
    </div>
  )
}
