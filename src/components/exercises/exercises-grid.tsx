"use client"

import { useMemo, useState } from "react"
import Fuse from "fuse.js"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ExerciseCard } from "./exercise-card"
import { ExercisesFilters } from "./exercises-filters"
import { ExerciseFormDialog } from "./exercise-form-dialog"
import { useExercises } from "@/hooks/use-exercises"
import type { ExerciseRow } from "@/actions/exercises.actions"
import { Plus } from "lucide-react"

export function ExercisesGrid() {
  const { data: exercises = [], isLoading } = useExercises()
  const [search, setSearch] = useState("")
  const [muscleFilter, setMuscleFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ExerciseRow | null>(null)

  const fuse = useMemo(
    () =>
      new Fuse(exercises, {
        keys: ["name", "description", "uuid"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [exercises]
  )

  const filtered = useMemo(() => {
    let result: ExerciseRow[] = search
      ? fuse.search(search).map((r) => r.item)
      : exercises

    if (muscleFilter !== "all") {
      result = result.filter((e) => e.muscle === muscleFilter)
    }

    if (levelFilter !== "all") {
      result = result.filter((e) => e.level_uuid?.includes(levelFilter))
    }

    return result
  }, [search, muscleFilter, levelFilter, exercises, fuse])

  function handleEdit(exercise: ExerciseRow) {
    setEditingExercise(exercise)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingExercise(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ExercisesFilters
          search={search}
          onSearchChange={setSearch}
          muscleFilter={muscleFilter}
          onMuscleFilterChange={setMuscleFilter}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
        />
        <Button onClick={handleAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Novo exercício
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Nenhum exercício encontrado
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((exercise) => (
            <ExerciseCard key={exercise.uuid} exercise={exercise} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} exercício{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      <ExerciseFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingExercise(null) }}
        exercise={editingExercise}
      />
    </div>
  )
}
