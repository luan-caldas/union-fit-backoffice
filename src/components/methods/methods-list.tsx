"use client"

import { useMemo, useState } from "react"
import Fuse from "fuse.js"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MethodListRow } from "./method-row"
import { MethodsFilters } from "./methods-filters"
import { MethodFormDialog } from "./method-form-dialog"
import { useMethods } from "@/hooks/use-methods"
import { useLevels, useObjectives } from "@/hooks/use-exercises"
import type { MethodRow } from "@/actions/methods.actions"
import { Plus } from "lucide-react"

export function MethodsList() {
  const { data: methods = [], isLoading } = useMethods()
  const { data: levels = [] } = useLevels()
  const { data: objectives = [] } = useObjectives()
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [objectiveFilter, setObjectiveFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<MethodRow | null>(null)

  const fuse = useMemo(
    () =>
      new Fuse(methods, {
        keys: ["name", "description", "uuid"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [methods]
  )

  const filtered = useMemo(() => {
    let result: MethodRow[] = search
      ? fuse.search(search).map((r) => r.item)
      : methods

    if (levelFilter !== "all") {
      result = result.filter((m) => m.level_uuid?.includes(levelFilter))
    }
    if (objectiveFilter !== "all") {
      result = result.filter((m) => m.objective_uuid?.includes(objectiveFilter))
    }

    return result
  }, [search, levelFilter, objectiveFilter, methods, fuse])

  function handleEdit(method: MethodRow) {
    setEditingMethod(method)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditingMethod(null)
    setFormOpen(true)
  }

  function levelTitlesFor(uuids: string[] | null) {
    return (uuids ?? []).map((id) => levels.find((l) => l.uuid === id)?.title ?? id)
  }

  function objectiveTitlesFor(uuids: string[] | null) {
    return (uuids ?? []).map((id) => objectives.find((o) => o.uuid === id)?.title ?? id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <MethodsFilters
          search={search}
          onSearchChange={setSearch}
          levelFilter={levelFilter}
          onLevelFilterChange={setLevelFilter}
          objectiveFilter={objectiveFilter}
          onObjectiveFilterChange={setObjectiveFilter}
        />
        <Button onClick={handleAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Novo método
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Nenhum método encontrado
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((method) => (
            <MethodListRow
              key={method.uuid}
              method={method}
              levelTitles={levelTitlesFor(method.level_uuid)}
              objectiveTitles={objectiveTitlesFor(method.objective_uuid)}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {!isLoading && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} método{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      <MethodFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingMethod(null) }}
        method={editingMethod}
      />
    </div>
  )
}
