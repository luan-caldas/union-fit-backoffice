"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExercisePickerDialog } from "@/components/training/exercise-picker-dialog"
import {
  addExerciseToCardio,
  deleteCardio,
  updateCardio,
} from "@/actions/cardio.actions"
import type { Cardio } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { Pencil, Plus, Trash2 } from "lucide-react"

interface CardioHeaderActionsProps {
  cardio: Cardio
  allExercises: ExerciseRow[]
  userUuid: string
}

export function CardioHeaderActions({
  cardio,
  allExercises,
  userUuid,
}: CardioHeaderActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(cardio.name)
  const [description, setDescription] = useState(cardio.description ?? "")
  const [duration, setDuration] = useState(String(cardio.duration ?? ""))

  function handleSave() {
    startTransition(async () => {
      await updateCardio(
        cardio.uuid,
        {
          name: name.trim() || cardio.name,
          description: description.trim() || null,
          duration: duration ? Number(duration) : null,
        },
        userUuid
      )
      setEditOpen(false)
    })
  }

  function handleDelete() {
    if (
      !confirm(
        `Excluir o treino de cardio "${cardio.name}"? Isso remove todos os exercícios.`
      )
    ) {
      return
    }
    startTransition(async () => {
      await deleteCardio(cardio.uuid, userUuid)
    })
  }

  function handleAddExercise(exercise: ExerciseRow) {
    const nextOrder = cardio.exercises.length
    startTransition(async () => {
      await addExerciseToCardio(cardio.uuid, exercise.uuid, userUuid, nextOrder)
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            setAddOpen(true)
          }}
          disabled={isPending}
          title="Adicionar exercício"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            setName(cardio.name)
            setDescription(cardio.description ?? "")
            setDuration(String(cardio.duration ?? ""))
            setEditOpen(true)
          }}
          disabled={isPending}
          title="Editar treino de cardio"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          disabled={isPending}
          title="Excluir treino de cardio"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Treino de Cardio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cardio 1"
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Corrida intervalada"
              />
            </div>
            <div className="space-y-1">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              Salvar
            </Button>
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
