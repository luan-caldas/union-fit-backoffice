"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmButton } from "@/components/ui/confirm-button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ExercisePickerDialog } from "@/components/training/exercise-picker-dialog"
import { CardioMetricsDialog } from "./cardio-metrics-dialog"
import { buildMetricBadges } from "@/lib/utils/cardio-metrics"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import { MUSCLE_LABELS } from "@/lib/constants/muscles"
import {
  removeExerciseFromCardio,
  swapExerciseInCardio,
} from "@/actions/cardio.actions"
import type { CardioExercise } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"
import { Pencil, RefreshCw, Trash2 } from "lucide-react"

type Muscle = Database["public"]["Enums"]["Muscle"]

interface CardioExerciseRowProps {
  exercise: CardioExercise
  allExercises: ExerciseRow[]
  userId: string
  dragHandle?: React.ReactNode
}

export function CardioExerciseRow({
  exercise,
  allExercises,
  userId,
  dragHandle,
}: CardioExerciseRowProps) {
  const [metricsOpen, setMetricsOpen] = useState(false)
  const [swapOpen, setSwapOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const thumbnail =
    getYouTubeThumbnail(exercise.exercise_details?.video_url) ??
    exercise.exercise_details?.image_url ??
    null

  const muscle = exercise.exercise_details?.muscle as Muscle | undefined
  const badges = buildMetricBadges(exercise)

  function handleRemove() {
    startTransition(async () => {
      await removeExerciseFromCardio(exercise.uuid, userId)
    })
  }

  function handleSwap(newExercise: ExerciseRow) {
    startTransition(async () => {
      await swapExerciseInCardio(exercise.uuid, newExercise.uuid, userId)
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setMetricsOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setMetricsOpen(true)
        }
      }}
      className="flex cursor-pointer items-center gap-3 py-2.5 px-4 border-b border-border last:border-0 hover:bg-surface-lowest"
    >
      {/* stopPropagation prevents the drag handle from opening the metrics dialog */}
      <span onClick={(e) => e.stopPropagation()} className="contents">
        {dragHandle}
      </span>

      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-highest">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={exercise.exercise_details?.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {muscle ? MUSCLE_LABELS[muscle]?.slice(0, 3) : "—"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {exercise.exercise_details?.name ?? "Exercício"}
        </p>
        <p className="text-xs text-muted-foreground">
          {muscle ? MUSCLE_LABELS[muscle] : "—"}
        </p>
        {badges.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <Badge key={badge.key} variant="outline" className="text-xs h-5">
                {badge.label} {badge.value}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Sem métricas definidas
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setMetricsOpen(true)}
              disabled={isPending}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar métricas</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setSwapOpen(true)}
              disabled={isPending}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Trocar exercício</TooltipContent>
        </Tooltip>

        <ConfirmButton
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onConfirm={handleRemove}
          disabled={isPending}
          confirmLabel="Remover"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ConfirmButton>
      </div>

      <CardioMetricsDialog
        open={metricsOpen}
        onClose={() => setMetricsOpen(false)}
        exercise={exercise}
        userId={userId}
      />

      <ExercisePickerDialog
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        exercises={allExercises}
        onSelect={handleSwap}
      />
    </div>
  )
}
