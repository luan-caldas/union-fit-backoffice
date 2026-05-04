"use client"

import { useMemo, useState } from "react"
import Fuse from "fuse.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { MUSCLE_OPTIONS, MUSCLE_LABELS } from "@/lib/constants/muscles"
import { getYouTubeThumbnail } from "@/lib/utils/youtube"
import type { ExerciseRow } from "@/actions/exercises.actions"
import type { Database } from "@/lib/supabase/database.types"

type Muscle = Database["public"]["Enums"]["Muscle"]

interface ExercisePickerDialogProps {
  open: boolean
  onClose: () => void
  exercises: ExerciseRow[]
  onSelect: (exercise: ExerciseRow) => void
}

export function ExercisePickerDialog({
  open,
  onClose,
  exercises,
  onSelect,
}: ExercisePickerDialogProps) {
  const [search, setSearch] = useState("")
  const [muscleFilter, setMuscleFilter] = useState<string>("all")

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
    let result = search
      ? fuse.search(search).map((r) => r.item)
      : exercises

    if (muscleFilter !== "all") {
      result = result.filter((e) => e.muscle === muscleFilter)
    }

    return result
  }, [search, muscleFilter, exercises, fuse])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Selecionar Exercício</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 px-6 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar exercício..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={muscleFilter} onValueChange={(v) => setMuscleFilter(v ?? "all")}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Músculo">
                {muscleFilter === "all"
                  ? "Todos os músculos"
                  : (MUSCLE_OPTIONS.find((m) => m.value === muscleFilter)?.label ?? muscleFilter)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os músculos</SelectItem>
              {MUSCLE_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum exercício encontrado
            </p>
          ) : (
            <ul>
              {filtered.map((exercise) => {
                const thumbnail = getYouTubeThumbnail(exercise.video_url) ?? exercise.image_url
                return (
                  <li key={exercise.uuid}>
                    <button
                      type="button"
                      onClick={() => { onSelect(exercise); onClose() }}
                      className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-surface-low border-b border-border last:border-0"
                    >
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-highest">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={exercise.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                            {(exercise.muscle as Muscle) ? MUSCLE_LABELS[exercise.muscle as Muscle]?.slice(0, 3) : "—"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {MUSCLE_LABELS[exercise.muscle as Muscle] ?? exercise.muscle}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
