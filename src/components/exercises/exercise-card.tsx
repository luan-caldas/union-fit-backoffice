"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MUSCLE_LABELS } from "@/lib/constants/muscles"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"
import { Pencil } from "lucide-react"

type Muscle = Database["public"]["Enums"]["Muscle"]

interface ExerciseCardProps {
  exercise: ExerciseRow
  onEdit: (exercise: ExerciseRow) => void
}

export function ExerciseCard({ exercise, onEdit }: ExerciseCardProps) {
  const thumbnail =
    getYouTubeThumbnail(exercise.video_url) ?? exercise.image_url ?? null

  return (
    <div className="group relative rounded-xl border border-border bg-white overflow-hidden hover:shadow-sm transition-shadow">
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

      <Button
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onEdit(exercise)}
        title="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
