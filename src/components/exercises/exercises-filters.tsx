"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { MUSCLE_OPTIONS } from "@/lib/constants/muscles"
import { useLevels } from "@/hooks/use-exercises"

interface ExercisesFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  muscleFilter: string
  onMuscleFilterChange: (v: string) => void
  levelFilter: string
  onLevelFilterChange: (v: string) => void
}

export function ExercisesFilters({
  search,
  onSearchChange,
  muscleFilter,
  onMuscleFilterChange,
  levelFilter,
  onLevelFilterChange,
}: ExercisesFiltersProps) {
  const { data: levels = [] } = useLevels()

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-56">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar exercício..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={muscleFilter} onValueChange={onMuscleFilterChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Músculo" />
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
      <Select value={levelFilter} onValueChange={onLevelFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Nível" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os níveis</SelectItem>
          {levels.map((l) => (
            <SelectItem key={l.uuid} value={l.uuid}>
              {l.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
