"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MethodPickerDialog } from "./method-picker-dialog"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import { MUSCLE_LABELS } from "@/lib/constants/muscles"
import {
  updateExerciseSets,
  updateExerciseMethod,
  removeExerciseFromDivision,
  swapExerciseInDivision,
} from "@/actions/training.actions"
import type { TrainingDivisionExercise } from "@/actions/training.actions"
import type { MethodRow } from "@/actions/methods.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { ExercisePickerDialog } from "./exercise-picker-dialog"
import { Trash2, RefreshCw, Minus, Plus } from "lucide-react"
import { ConfirmButton } from "@/components/ui/confirm-button"
import type { Database } from "@/lib/supabase/database.types"

type Muscle = Database["public"]["Enums"]["Muscle"]

interface DivisionExerciseRowProps {
  exercise: TrainingDivisionExercise
  methods: MethodRow[]
  allExercises: ExerciseRow[]
  userId: string
}

export function DivisionExerciseRow({
  exercise,
  methods,
  allExercises,
  userId,
}: DivisionExerciseRowProps) {
  const [sets, setSets] = useState(exercise.sets)
  const [methodDialogOpen, setMethodDialogOpen] = useState(false)
  const [swapDialogOpen, setSwapDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const thumbnail =
    getYouTubeThumbnail(exercise.exercise_details?.video_url) ??
    exercise.exercise_details?.image_url ??
    null

  const muscle = exercise.exercise_details?.muscle as Muscle | undefined

  function handleSetsChange(delta: number) {
    const next = Math.max(1, sets + delta)
    setSets(next)
    startTransition(async () => {
      await updateExerciseSets(exercise.uuid, next, userId)
    })
  }

  function handleMethodSelect(method: MethodRow | null) {
    startTransition(async () => {
      await updateExerciseMethod(exercise.uuid, method?.uuid ?? null, userId)
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeExerciseFromDivision(exercise.uuid, userId)
    })
  }

  function handleSwap(newExercise: ExerciseRow) {
    startTransition(async () => {
      await swapExerciseInDivision(exercise.uuid, newExercise.uuid, userId)
    })
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-4 border-b border-border last:border-0 hover:bg-surface-lowest">
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
        {exercise.method_details && (
          <Badge
            variant="outline"
            className="mt-1 cursor-pointer text-xs h-5 hover:bg-surface-low"
            onClick={() => setMethodDialogOpen(true)}
          >
            {exercise.method_details.name}
          </Badge>
        )}
        {!exercise.method_details && (
          <button
            type="button"
            onClick={() => setMethodDialogOpen(true)}
            className="mt-1 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            + Adicionar método
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleSetsChange(-1)}
          disabled={isPending || sets <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{sets}s</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleSetsChange(1)}
          disabled={isPending}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setSwapDialogOpen(true)}
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

      <MethodPickerDialog
        open={methodDialogOpen}
        onClose={() => setMethodDialogOpen(false)}
        methods={methods}
        onSelect={handleMethodSelect}
        currentMethodUuid={exercise.method_uuid}
      />

      <ExercisePickerDialog
        open={swapDialogOpen}
        onClose={() => setSwapDialogOpen(false)}
        exercises={allExercises}
        onSelect={handleSwap}
      />
    </div>
  )
}
