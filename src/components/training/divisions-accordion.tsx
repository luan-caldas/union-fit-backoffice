"use client"

import { useTransition } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DivisionExerciseRow } from "./division-exercise-row"
import { DivisionHeaderActions } from "./division-header-form"
import { addDivision } from "@/actions/training.actions"
import type { TrainingData } from "@/actions/training.actions"
import type { MethodRow } from "@/actions/methods.actions"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { Plus } from "lucide-react"

interface DivisionsAccordionProps {
  training: TrainingData
  methods: MethodRow[]
  allExercises: ExerciseRow[]
  userId: string
}

export function DivisionsAccordion({
  training,
  methods,
  allExercises,
  userId,
}: DivisionsAccordionProps) {
  const [isPending, startTransition] = useTransition()

  function handleAddDivision() {
    startTransition(async () => {
      await addDivision(training.uuid, training.user_uuid, training.divisions.length)
    })
  }

  return (
    <div className="space-y-2">
      <Accordion type="multiple" className="space-y-2">
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
                <div>
                  {[...division.exercises]
                    .sort((a, b) => a.order - b.order)
                    .map((ex) => (
                      <DivisionExerciseRow
                        key={ex.uuid}
                        exercise={ex}
                        methods={methods}
                        allExercises={allExercises}
                        userId={userId}
                      />
                    ))}
                </div>
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
