import { DivisionsAccordion } from "@/components/training/divisions-accordion"
import { formatDate } from "@/lib/utils/format"
import { Badge } from "@/components/ui/badge"
import type { TrainingData } from "@/actions/training.actions"
import type { MethodRow } from "@/actions/methods.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"

interface UserTrainingSectionProps {
  training: TrainingData
  methods: MethodRow[]
  allExercises: ExerciseRow[]
  userId: string
}

export function UserTrainingSection({
  training,
  methods,
  allExercises,
  userId,
}: UserTrainingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="font-semibold text-foreground mb-4">Treino</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
          <span className="text-muted-foreground">
            Período:{" "}
            <span className="text-foreground font-medium">
              {formatDate(training.date_start)} – {formatDate(training.date_end)}
            </span>
          </span>
          {training.level && (
            <span className="text-muted-foreground">
              Nível:{" "}
              <span className="text-foreground font-medium">{training.level}</span>
            </span>
          )}
          {training.sessions_per_week && (
            <span className="text-muted-foreground">
              Sessões/semana:{" "}
              <span className="text-foreground font-medium">
                {training.sessions_per_week}
              </span>
            </span>
          )}
        </div>

        {training.periodization && training.periodization.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Periodização
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...training.periodization]
                .sort((a, b) => a.order - b.order)
                .map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    Semana {i + 1}: {p.min_repetitions}–{p.max_repetitions} reps
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      <DivisionsAccordion
        training={training}
        methods={methods}
        allExercises={allExercises}
        userId={userId}
      />
    </div>
  )
}
