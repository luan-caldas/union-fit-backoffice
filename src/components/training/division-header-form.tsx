"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { updateDivision, deleteDivision } from "@/actions/training.actions"
import type { TrainingDivision } from "@/actions/training.actions"
import { Pencil, Trash2, Plus } from "lucide-react"
import { addExerciseToDivision } from "@/actions/training.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { ExercisePickerDialog } from "./exercise-picker-dialog"

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

  const [name, setName] = useState(division.name ?? "")
  const [description, setDescription] = useState(division.description ?? "")
  const [duration, setDuration] = useState(String(division.duration ?? ""))

  function handleSave() {
    startTransition(async () => {
      await updateDivision(
        division.uuid,
        {
          name: name || undefined,
          description: description || undefined,
          duration: duration ? Number(duration) : null,
        },
        userUuid
      )
      setEditOpen(false)
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
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
          disabled={isPending}
          title="Excluir divisão"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Divisão</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Treino A" />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Peito + Tríceps" />
            </div>
            <div className="space-y-1">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExercisePickerDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        exercises={allExercises}
        onSelect={handleAddExercise}
      />
    </>
  )
}
