"use client"

import { Badge } from "@/components/ui/badge"
import { MUSCLE_LABELS } from "@/lib/constants/muscles"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"

type Muscle = Database["public"]["Enums"]["Muscle"]

interface ExerciseCardProps {
  exercise: ExerciseRow
  onEdit: (exercise: ExerciseRow) => void
}

export function ExerciseCard({ exercise, onEdit }: ExerciseCardProps) {
  const thumbnail =
    getYouTubeThumbnail(exercise.video_url) ?? exercise.image_url ?? null

  return (
    <div
      className="rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onEdit(exercise)}
    >
      <div className="aspect-video w-full bg-surface-highest overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={exercise.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">
              {MUSCLE_LABELS[exercise.muscle as Muscle] ?? exercise.muscle}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-semibold text-sm line-clamp-1">{exercise.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {MUSCLE_LABELS[exercise.muscle as Muscle] ?? exercise.muscle}
        </p>
        {exercise.repetition_type === "ISOMETRIC" && (
          <Badge variant="secondary" className="mt-1.5 text-xs h-4">
            Isométrico
          </Badge>
        )}
      </div>

    </div>
  )
}
