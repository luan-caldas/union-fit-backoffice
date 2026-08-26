"use client"

import { useEffect, useState, useTransition } from "react"
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
import { CardioExerciseRow } from "./cardio-exercise-row"
import { CardioHeaderActions } from "./cardio-header-actions"
import {
  addCardio,
  reorderCardioExercises,
  reorderCardios,
} from "@/actions/cardio.actions"
import type { Cardio, CardioExercise } from "@/actions/cardio.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { Activity, GripVertical, Plus } from "lucide-react"

interface CardiosAccordionProps {
  cardios: Cardio[]
  allExercises: ExerciseRow[]
  userId: string
}

function DragHandle({
  listeners,
  attributes,
}: {
  listeners: ReturnType<typeof useSortable>["listeners"]
  attributes: ReturnType<typeof useSortable>["attributes"]
}) {
  return (
    <button
      {...listeners}
      {...attributes}
      className="cursor-grab touch-none text-muted-foreground hover:text-foreground p-1 -ml-1 shrink-0"
      tabIndex={-1}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
}

function SortableExerciseRow({
  exercise,
  allExercises,
  userId,
}: {
  exercise: CardioExercise
  allExercises: ExerciseRow[]
  userId: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.uuid })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50 relative z-50" : ""}
    >
      <CardioExerciseRow
        exercise={exercise}
        allExercises={allExercises}
        userId={userId}
        dragHandle={<DragHandle listeners={listeners} attributes={attributes} />}
      />
    </div>
  )
}

function SortableCardioItem({
  cardio,
  exercises,
  allExercises,
  userId,
  onExerciseDragEnd,
}: {
  cardio: Cardio
  exercises: CardioExercise[]
  allExercises: ExerciseRow[]
  userId: string
  onExerciseDragEnd: (cardioUuid: string, event: DragEndEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardio.uuid })

  // Wrap in a plain div so dnd-kit's ref+style land on a div, not the Base UI AccordionItem
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50 relative z-50" : ""}
    >
      <AccordionItem
        value={cardio.uuid}
        className="rounded-lg border border-border bg-white overflow-hidden"
      >
        <div className="flex items-center px-4">
          <DragHandle listeners={listeners} attributes={attributes} />
          <AccordionTrigger className="flex-1 py-3 hover:no-underline">
            <div className="flex items-center gap-3 text-left min-w-0">
              <span className="font-semibold text-sm truncate">{cardio.name}</span>
              {cardio.description && (
                <span className="text-xs text-muted-foreground hidden sm:block truncate">
                  {cardio.description}
                </span>
              )}
              {cardio.duration && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {cardio.duration} min
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto mr-2 shrink-0">
                {exercises.length} exercício
                {exercises.length !== 1 ? "s" : ""}
              </span>
            </div>
          </AccordionTrigger>
          <CardioHeaderActions
            cardio={cardio}
            allExercises={allExercises}
            userUuid={userId}
          />
        </div>
        <AccordionContent className="p-0">
          {exercises.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-muted-foreground">
              Nenhum exercício neste treino
            </p>
          ) : (
            <DndContext
              id={`exercises-dnd-${cardio.uuid}`}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onExerciseDragEnd(cardio.uuid, event)}
            >
              <SortableContext
                items={exercises.map((e) => e.uuid)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {exercises.map((exercise) => (
                    <SortableExerciseRow
                      key={exercise.uuid}
                      exercise={exercise}
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
    </div>
  )
}

function sortedByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

function exercisesByCardioFrom(cardios: Cardio[]): Record<string, CardioExercise[]> {
  return Object.fromEntries(
    cardios.map((c) => [c.uuid, sortedByOrder(c.exercises)])
  )
}

export function CardiosAccordion({
  cardios: initialCardios,
  allExercises,
  userId,
}: CardiosAccordionProps) {
  const [isPending, startTransition] = useTransition()
  const [cardios, setCardios] = useState(() => sortedByOrder(initialCardios))
  const [exercisesByCardio, setExercisesByCardio] = useState(() =>
    exercisesByCardioFrom(initialCardios)
  )

  // Resync with server after each revalidatePath.
  useEffect(() => {
    setCardios(sortedByOrder(initialCardios))
    setExercisesByCardio(exercisesByCardioFrom(initialCardios))
  }, [initialCardios])

  function handleAddCardio() {
    startTransition(async () => {
      await addCardio(userId, cardios.length)
    })
  }

  function handleCardioDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = cardios.findIndex((c) => c.uuid === active.id)
    const newIndex = cardios.findIndex((c) => c.uuid === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(cardios, oldIndex, newIndex)
    setCardios(reordered)
    startTransition(async () => {
      await reorderCardios(
        reordered.map((c, i) => ({ uuid: c.uuid, order: i })),
        userId
      )
    })
  }

  function handleExerciseDragEnd(cardioUuid: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const exercises = exercisesByCardio[cardioUuid] ?? []
    const oldIndex = exercises.findIndex((e) => e.uuid === active.id)
    const newIndex = exercises.findIndex((e) => e.uuid === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(exercises, oldIndex, newIndex)
    setExercisesByCardio((prev) => ({ ...prev, [cardioUuid]: reordered }))
    startTransition(async () => {
      await reorderCardioExercises(
        reordered.map((e, i) => ({ uuid: e.uuid, order: i })),
        userId
      )
    })
  }

  return (
    <div className="space-y-2">
      {cardios.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">Sem treino de cardio</p>
          <p className="text-sm text-muted-foreground mt-1">
            Este usuário ainda não possui treinos de cardio
          </p>
        </div>
      ) : (
        <DndContext
          id="cardios-dnd"
          collisionDetection={closestCenter}
          onDragEnd={handleCardioDragEnd}
        >
          <SortableContext
            items={cardios.map((c) => c.uuid)}
            strategy={verticalListSortingStrategy}
          >
            <Accordion className="space-y-2">
              {cardios.map((cardio) => (
                <SortableCardioItem
                  key={cardio.uuid}
                  cardio={cardio}
                  exercises={exercisesByCardio[cardio.uuid] ?? []}
                  allExercises={allExercises}
                  userId={userId}
                  onExerciseDragEnd={handleExerciseDragEnd}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddCardio}
        disabled={isPending}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Adicionar treino de cardio
      </Button>
    </div>
  )
}
