"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateDivision, deleteDivision, duplicateDivision } from "@/actions/training.actions"
import type { TrainingDivision } from "@/actions/training.actions"
import { Pencil, Trash2, Plus, Copy } from "lucide-react"
import { addExerciseToDivision } from "@/actions/training.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { ExercisePickerDialog } from "./exercise-picker-dialog"
import { DivisionFormDialog, type DivisionFormValues } from "./division-form-dialog"

interface DivisionHeaderFormProps {
  division: TrainingDivision
  allExercises: ExerciseRow[]
  userUuid: string
}

export function DivisionHeaderActions({
  division,
  allExercises,
  userUuid,
}: DivisionHeaderFormProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave(values: DivisionFormValues) {
    startTransition(async () => {
      await updateDivision(
        division.uuid,
        {
          name: values.name,
          description: values.description || undefined,
          duration: values.duration,
        },
        userUuid
      )
      setEditOpen(false)
    })
  }

  function handleDuplicate() {
    startTransition(async () => {
      await duplicateDivision(division.uuid, userUuid)
    })
  }

  function handleDelete() {
    if (!confirm(`Excluir divisão "${division.name ?? "sem nome"}"? Isso remove todos os exercícios.`)) return
    startTransition(async () => {
      await deleteDivision(division.uuid, userUuid)
    })
  }

  function handleAddExercise(exercise: ExerciseRow) {
    const nextOrder = division.exercises.length
    startTransition(async () => {
      await addExerciseToDivision(division.uuid, exercise.uuid, userUuid, nextOrder)
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); setAddOpen(true) }}
          disabled={isPending}
          title="Adicionar exercício"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); setEditOpen(true) }}
          disabled={isPending}
          title="Editar divisão"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => { e.stopPropagation(); handleDuplicate() }}
          disabled={isPending}
          title="Duplicar divisão"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
          disabled={isPending}
          title="Excluir divisão"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <DivisionFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Divisão"
        initialValues={{
          name: division.name ?? "",
          description: division.description ?? "",
          duration: String(division.duration ?? ""),
        }}
        isPending={isPending}
        onSubmit={handleSave}
      />

      <ExercisePickerDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        exercises={allExercises}
        onSelect={handleAddExercise}
      />
    </>
  )
}
