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
import { useLevels, useObjectives } from "@/hooks/use-exercises"

interface MethodsFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  levelFilter: string
  onLevelFilterChange: (v: string) => void
  objectiveFilter: string
  onObjectiveFilterChange: (v: string) => void
}

export function MethodsFilters({
  search,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  objectiveFilter,
  onObjectiveFilterChange,
}: MethodsFiltersProps) {
  const { data: levels = [] } = useLevels()
  const { data: objectives = [] } = useObjectives()

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-56">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar método..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
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
      <Select value={objectiveFilter} onValueChange={onObjectiveFilterChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Objetivo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os objetivos</SelectItem>
          {objectives.map((o) => (
            <SelectItem key={o.uuid} value={o.uuid}>
              {o.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
