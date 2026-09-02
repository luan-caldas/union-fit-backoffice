import { CardiosAccordion } from "@/components/cardio/cardios-accordion"
import type { Cardio } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"

interface UserCardioSectionProps {
  cardios: Cardio[]
  allExercises: ExerciseRow[]
  userId: string
}

export function UserCardioSection({
  cardios,
  allExercises,
  userId,
}: UserCardioSectionProps) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">Cardio</h3>
      <CardiosAccordion
        cardios={cardios}
        allExercises={allExercises}
        userId={userId}
      />
    </div>
  )
}
