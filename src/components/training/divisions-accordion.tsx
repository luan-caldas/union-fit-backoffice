"use client"

import { useState, useEffect, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DivisionExerciseRow } from "./division-exercise-row"
import { DivisionHeaderActions } from "./division-header-form"
import { addDivision, reorderExercises } from "@/actions/training.actions"
import type { TrainingData, TrainingDivisionExercise } from "@/actions/training.actions"
import type { MethodRow } from "@/actions/methods.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { GripVertical, Plus } from "lucide-react"

interface DivisionsAccordionProps {
  training: TrainingData
  methods: MethodRow[]
  allExercises: ExerciseRow[]
  userId: string
}

interface SortableRowProps {
  exercise: TrainingDivisionExercise
  methods: MethodRow[]
  allExercises: ExerciseRow[]
  userId: string
}

function SortableDivisionExerciseRow({
  exercise,
  methods,
  allExercises,
  userId,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.uuid })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragHandle = (
    <button
      {...listeners}
      {...attributes}
      className="cursor-grab touch-none text-muted-foreground hover:text-foreground p-1 -ml-1 shrink-0"
      tabIndex={-1}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50 relative z-50" : ""}
    >
      <DivisionExerciseRow
        exercise={exercise}
        methods={methods}
        allExercises={allExercises}
        userId={userId}
        dragHandle={dragHandle}
      />
    </div>
  )
}

export function DivisionsAccordion({
  training,
  methods,
  allExercises,
  userId,
}: DivisionsAccordionProps) {
  const [isPending, startTransition] = useTransition()

  const [divisionExercises, setDivisionExercises] = useState<
    Record<string, TrainingDivisionExercise[]>
  >(() =>
    Object.fromEntries(
      training.divisions.map((d) => [
        d.uuid,
        [...d.exercises].sort((a, b) => a.order - b.order),
      ])
    )
  )

  useEffect(() => {
    setDivisionExercises(
      Object.fromEntries(
        training.divisions.map((d) => [
          d.uuid,
          [...d.exercises].sort((a, b) => a.order - b.order),
        ])
      )
    )
  }, [training])

  function handleAddDivision() {
    startTransition(async () => {
      await addDivision(training.uuid, training.user_uuid, training.divisions.length)
    })
  }

  function handleDragEnd(divisionUuid: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setDivisionExercises((prev) => {
      const exercises = prev[divisionUuid] ?? []
      const oldIndex = exercises.findIndex((e) => e.uuid === active.id)
      const newIndex = exercises.findIndex((e) => e.uuid === over.id)
      const reordered = arrayMove(exercises, oldIndex, newIndex)

      startTransition(async () => {
        await reorderExercises(
          reordered.map((e, i) => ({ uuid: e.uuid, order: i })),
          userId
        )
      })

      return { ...prev, [divisionUuid]: reordered }
    })
  }

  return (
    <div className="space-y-2">
      <Accordion className="space-y-2">
        {training.divisions.map((division) => (
          <AccordionItem
            key={division.uuid}
            value={division.uuid}
            className="rounded-lg border border-border bg-white overflow-hidden"
          >
            <div className="flex items-center px-4">
              <AccordionTrigger className="flex-1 py-3 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-semibold text-sm">
                    {division.name ?? "Sem nome"}
                  </span>
                  {division.description && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {division.description}
                    </span>
                  )}
                  {division.duration && (
                    <span className="text-xs text-muted-foreground">
                      {division.duration} min
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto mr-2">
                    {division.exercises.length} exercício{division.exercises.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </AccordionTrigger>
              <DivisionHeaderActions
                division={division}
                allExercises={allExercises}
                userUuid={userId}
              />
            </div>
            <AccordionContent className="p-0">
              {division.exercises.length === 0 ? (
                <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                  Nenhum exercício nesta divisão
                </p>
              ) : (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(division.uuid, event)}
                >
                  <SortableContext
                    items={(divisionExercises[division.uuid] ?? []).map((e) => e.uuid)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div>
                      {(divisionExercises[division.uuid] ?? []).map((ex) => (
                        <SortableDivisionExerciseRow
                          key={ex.uuid}
                          exercise={ex}
                          methods={methods}
                          allExercises={allExercises}
                          userId={userId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddDivision}
        disabled={isPending}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar divisão
      </Button>
    </div>
  )
}
